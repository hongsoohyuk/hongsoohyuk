'use client';

import {createStore} from 'zustand';

import {COMMAND_NAMES} from '../utils/commands';
import {execute} from '../utils/executor';
import {VirtualFS} from '../utils/filesystem';

import type {CliData, TerminalLine, VimOpenRequest} from '../types';

// === Mode ===

type TerminalMode =
  | {type: 'normal'}
  | {type: 'vim'; request: VimOpenRequest}
  | {type: 'donut'}
  | {type: 'heredoc'}
  | {type: 'ask'; streaming: boolean};

// === State & Actions ===

type HeredocState = {
  command: string;
  delimiter: string;
  lines: string[];
};

type TerminalState = {
  lines: TerminalLine[];
  cwd: string;
  env: Record<string, string>;
  inputValue: string;
  historyIndex: number;
  tabCompletions: string[] | null;
  mode: TerminalMode;
};

type TerminalActions = {
  setInput: (value: string) => void;
  submitCommand: (input: string) => void;
  navigateHistory: (direction: 'up' | 'down') => void;
  handleTab: (currentInput: string) => string;
  clearTabCompletions: () => void;
  vimSave: (filePath: string, content: string) => string | null;
  exitMode: () => void;
  cancelHeredoc: () => void;
  cancelAsk: () => void;
};

export type TerminalStore = TerminalState & TerminalActions;

// === Constants ===

const WELCOME_MESSAGE = [
  'Welcome to hongsoohyuk.com',
  'Type "help" for available commands.',
  'Type "ls" to see available directories.',
  '',
  '',
].join('\n');

const MAX_HISTORY = 200;

const DEFAULT_ENV: Record<string, string> = {
  USER: 'guest',
  HOME: '~',
  HOSTNAME: 'hongsoohyuk',
  SHELL: '/bin/hsh',
  TERM: 'xterm-256color',
};

// === Helpers ===

function makeLineId() {
  return `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}

function detectHeredoc(input: string): {command: string; delimiter: string} | null {
  const match = input.match(/(^|\s)(<<-?\s*['"]?(\w+)['"]?)/);
  if (!match) return null;
  const delimiter = match[3];
  const command = input.replace(match[2], '').trim();
  return {command, delimiter};
}

// === Store Factory ===

export function createTerminalStore(cliData: CliData) {
  const fs = new VirtualFS(cliData);
  const commandHistory: string[] = [];
  let heredocRef: HeredocState | null = null;
  const askHistory: Array<{role: string; parts: Array<{type: string; text: string}>}> = [];
  let askAbort: AbortController | null = null;

  async function handleAskInput(get: () => TerminalStore, set: (partial: Partial<TerminalState>) => void, text: string) {
    const userLineId = makeLineId();
    const assistantLineId = makeLineId();

    set({
      lines: [
        ...get().lines,
        {id: userLineId, output: `you: ${text}`, role: 'user'},
        {id: assistantLineId, output: 'assistant: ...', role: 'assistant'},
      ],
      mode: {type: 'ask', streaming: true},
    });

    askHistory.push({role: 'user', parts: [{type: 'text', text}]});

    try {
      const controller = new AbortController();
      askAbort = controller;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({messages: askHistory}),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        set({
          lines: get().lines.map((l) =>
            l.id === assistantLineId ? {...l, output: 'assistant: 오류가 발생했습니다.', isError: true} : l,
          ),
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const sseLines = buffer.split('\n');
        buffer = sseLines.pop() ?? '';

        for (const sseLine of sseLines) {
          if (!sseLine.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(sseLine.slice(6));
            if (data.type === 'text-delta' && data.delta) {
              fullText += data.delta;
              set({
                lines: get().lines.map((l) =>
                  l.id === assistantLineId ? {...l, output: `assistant: ${fullText}`} : l,
                ),
              });
            }
          } catch {
            // ignore SSE parse errors
          }
        }
      }

      if (fullText) {
        askHistory.push({role: 'assistant', parts: [{type: 'text', text: fullText}]});
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      set({
        lines: get().lines.map((l) =>
          l.id === assistantLineId ? {...l, output: 'assistant: 오류가 발생했습니다.', isError: true} : l,
        ),
      });
    } finally {
      askAbort = null;
      set({mode: {type: 'ask', streaming: false}});
    }
  }

  return createStore<TerminalStore>((set, get) => ({
    // State
    lines: [{id: 'welcome', output: WELCOME_MESSAGE}],
    cwd: '~',
    env: DEFAULT_ENV,
    inputValue: '',
    historyIndex: -1,
    tabCompletions: null,
    mode: {type: 'normal'},

    // Actions
    setInput: (value) => set({inputValue: value}),

    clearTabCompletions: () => set({tabCompletions: null}),

    submitCommand: (input) => {
      const lineId = makeLineId();
      const {cwd, env, mode} = get();

      set({tabCompletions: null});

      // === Heredoc collection mode ===
      if (heredocRef) {
        set({lines: [...get().lines, {id: lineId, output: `> ${input}`}]});

        if (input.trim() === heredocRef.delimiter) {
          const heredocContent = heredocRef.lines.join('\n');
          const hd = heredocRef;
          heredocRef = null;

          if (hd.command) {
            try {
              const result = execute(hd.command, {
                fs,
                cwd,
                env,
                history: [...commandHistory].reverse(),
                stdin: heredocContent,
              });
              if (result.output) {
                set({lines: [...get().lines, {id: makeLineId(), output: result.output, isError: result.isError}]});
              }
              set({
                mode: {type: 'normal'},
                ...(result.newCwd && {cwd: result.newCwd}),
                ...(result.newEnv && {env: result.newEnv}),
              });
            } catch {
              set({
                lines: [...get().lines, {id: makeLineId(), output: 'Error: command execution failed', isError: true}],
                mode: {type: 'normal'},
              });
            }
          } else {
            set({mode: {type: 'normal'}});
          }
        } else {
          heredocRef.lines.push(input);
        }
        set({inputValue: ''});
        return;
      }

      // === Ask session mode ===
      if (mode.type === 'ask') {
        const trimmed = input.trim();
        if (trimmed === 'exit' || trimmed === 'quit') {
          get().cancelAsk();
          set({lines: [...get().lines, {id: makeLineId(), output: 'AI 채팅 세션을 종료했습니다.'}]});
        } else if (trimmed) {
          handleAskInput(get, set, trimmed);
        }
        set({inputValue: ''});
        return;
      }

      // === Normal mode ===
      const trimmed = input.trim();

      if (!trimmed) {
        set({lines: [...get().lines, {id: lineId, command: '', output: '', cwd}], inputValue: ''});
        return;
      }

      // Check for heredoc
      const hdMatch = detectHeredoc(trimmed);
      if (hdMatch) {
        commandHistory.unshift(trimmed);
        if (commandHistory.length > MAX_HISTORY) commandHistory.pop();
        heredocRef = {command: hdMatch.command, delimiter: hdMatch.delimiter, lines: []};
        set({
          historyIndex: -1,
          lines: [...get().lines, {id: lineId, command: trimmed, output: '', cwd}],
          mode: {type: 'heredoc'},
          inputValue: '',
        });
        return;
      }

      commandHistory.unshift(trimmed);
      if (commandHistory.length > MAX_HISTORY) commandHistory.pop();

      const result = execute(trimmed, {
        fs,
        cwd,
        env,
        history: [...commandHistory].reverse(),
      });

      if (result.vim) {
        set({
          lines: [...get().lines, {id: lineId, command: trimmed, output: '', cwd}],
          inputValue: '',
          mode: {type: 'vim', request: result.vim},
        });
        return;
      }

      if (result.donut) {
        set({
          lines: [...get().lines, {id: lineId, command: trimmed, output: '', cwd}],
          inputValue: '',
          mode: {type: 'donut'},
        });
        return;
      }

      if (result.askSession) {
        set({
          lines: [...get().lines, {id: lineId, command: trimmed, output: result.output, cwd}],
          inputValue: '',
          mode: {type: 'ask', streaming: false},
        });
        if (result.askSession.message) {
          handleAskInput(get, set, result.askSession.message);
        }
        return;
      }

      if (result.clear) {
        set({
          lines: [],
          inputValue: '',
          ...(result.newCwd && {cwd: result.newCwd}),
          ...(result.newEnv && {env: result.newEnv}),
        });
        return;
      }

      set({
        lines: [
          ...get().lines,
          {id: lineId, command: trimmed, output: result.output, isError: result.isError, cwd},
        ],
        inputValue: '',
        historyIndex: -1,
        ...(result.newCwd && {cwd: result.newCwd}),
        ...(result.newEnv && {env: result.newEnv}),
      });
    },

    navigateHistory: (direction) => {
      if (commandHistory.length === 0) return;
      const {historyIndex} = get();
      const next =
        direction === 'up'
          ? Math.min(historyIndex + 1, commandHistory.length - 1)
          : Math.max(historyIndex - 1, -1);
      set({
        historyIndex: next,
        inputValue: next === -1 ? '' : commandHistory[next],
        tabCompletions: null,
      });
    },

    handleTab: (currentInput) => {
      const parts = currentInput.split(/\s+/);
      const isFirstWord = parts.length <= 1;
      const partial = parts[parts.length - 1] || '';

      let completions: string[];
      if (isFirstWord) {
        completions = COMMAND_NAMES.filter((name) => name.startsWith(partial)).sort();
      } else {
        completions = fs.completePath(get().cwd, partial);
      }

      if (completions.length === 0) {
        set({tabCompletions: null});
        return currentInput;
      }

      if (completions.length === 1) {
        const completed = completions[0];
        const prefix = parts.slice(0, -1).join(' ');
        set({tabCompletions: null});
        return prefix ? `${prefix} ${completed}` : completed;
      }

      const commonPrefix = findCommonPrefix(completions);
      if (commonPrefix.length > partial.length) {
        const prefix = parts.slice(0, -1).join(' ');
        set({tabCompletions: completions});
        return prefix ? `${prefix} ${commonPrefix}` : commonPrefix;
      }

      set({tabCompletions: completions});
      return currentInput;
    },

    vimSave: (filePath, content) => fs.writeFile('~', filePath, content),

    exitMode: () => set({mode: {type: 'normal'}}),

    cancelHeredoc: () => {
      heredocRef = null;
      set({mode: {type: 'normal'}});
    },

    cancelAsk: () => {
      askAbort?.abort();
      askAbort = null;
      askHistory.length = 0;
      set({mode: {type: 'normal'}});
    },
  }));
}

export type {TerminalMode};
