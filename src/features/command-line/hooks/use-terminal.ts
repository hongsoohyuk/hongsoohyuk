'use client';

import {useRef, useState} from 'react';

import {COMMAND_NAMES} from '../utils/commands';
import {execute} from '../utils/executor';
import {VirtualFS} from '../utils/filesystem';

import type {CliData, TerminalLine, VimOpenRequest} from '../types';

type HeredocState = {
  command: string;
  delimiter: string;
  lines: string[];
};

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

export function useTerminal(cliData: CliData) {
  const [fs] = useState(() => new VirtualFS(cliData));

  const [lines, setLines] = useState<TerminalLine[]>([{id: 'welcome', output: WELCOME_MESSAGE}]);
  const [cwd, setCwd] = useState('~');
  const [env, setEnv] = useState<Record<string, string>>(DEFAULT_ENV);
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const commandHistory = useRef<string[]>([]);
  const [tabCompletions, setTabCompletions] = useState<string[] | null>(null);
  const [vimRequest, setVimRequest] = useState<VimOpenRequest | null>(null);
  const [donutActive, setDonutActive] = useState(false);
  const [heredocActive, setHeredocActive] = useState(false);
  const heredocRef = useRef<HeredocState | null>(null);

  function makeLineId() {
    return `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function submitCommand(input: string) {
    const lineId = makeLineId();

    setTabCompletions(null);

    // === Heredoc collection mode ===
    const hd = heredocRef.current;
    if (hd) {
      // Show the line in terminal
      setLines((prev) => [...prev, {id: lineId, output: `> ${input}`}]);

      if (input.trim() === hd.delimiter) {
        // Heredoc complete — execute
        const heredocContent = hd.lines.join('\n');
        heredocRef.current = null;
        setHeredocActive(false);

        if (hd.command) {
          try {
            const result = execute(hd.command, {
              fs,
              cwd,
              env,
              history: [...commandHistory.current].reverse(),
              stdin: heredocContent,
            });

            if (result.output) {
              setLines((prev) => [...prev, {id: makeLineId(), output: result.output, isError: result.isError}]);
            }
            if (result.newCwd) setCwd(result.newCwd);
            if (result.newEnv) setEnv(result.newEnv);
          } catch {
            setLines((prev) => [...prev, {id: makeLineId(), output: 'Error: command execution failed', isError: true}]);
          }
        }
      } else {
        // Collect line
        hd.lines.push(input);
      }
      setInputValue('');
      return;
    }

    // === Normal mode ===
    const trimmed = input.trim();

    if (!trimmed) {
      setLines((prev) => [...prev, {id: lineId, command: '', output: '', cwd}]);
      setInputValue('');
      return;
    }

    // Check for heredoc pattern
    const hdMatch = detectHeredoc(trimmed);
    if (hdMatch) {
      commandHistory.current = [trimmed, ...commandHistory.current].slice(0, MAX_HISTORY);
      setHistoryIndex(-1);
      setLines((prev) => [...prev, {id: lineId, command: trimmed, output: '', cwd}]);
      heredocRef.current = {command: hdMatch.command, delimiter: hdMatch.delimiter, lines: []};
      setHeredocActive(true);
      setInputValue('');
      return;
    }

    commandHistory.current = [trimmed, ...commandHistory.current].slice(0, MAX_HISTORY);
    setHistoryIndex(-1);

    const result = execute(trimmed, {
      fs,
      cwd,
      env,
      history: [...commandHistory.current].reverse(),
    });

    if (result.vim) {
      setLines((prev) => [...prev, {id: lineId, command: trimmed, output: '', cwd}]);
      setInputValue('');
      setVimRequest(result.vim);
      return;
    }

    if (result.donut) {
      setLines((prev) => [...prev, {id: lineId, command: trimmed, output: '', cwd}]);
      setInputValue('');
      setDonutActive(true);
      return;
    }

    if (result.clear) {
      setLines([]);
      setInputValue('');
      if (result.newCwd) setCwd(result.newCwd);
      if (result.newEnv) setEnv(result.newEnv);
      return;
    }

    setLines((prev) => [
      ...prev,
      {
        id: lineId,
        command: trimmed,
        output: result.output,
        isError: result.isError,
        cwd,
      },
    ]);

    if (result.newCwd) setCwd(result.newCwd);
    if (result.newEnv) setEnv(result.newEnv);
    setInputValue('');
  }

  function navigateHistory(direction: 'up' | 'down') {
    const history = commandHistory.current;
    if (history.length === 0) return;

    setTabCompletions(null);

    setHistoryIndex((prev) => {
      const next = direction === 'up' ? Math.min(prev + 1, history.length - 1) : Math.max(prev - 1, -1);
      setInputValue(next === -1 ? '' : history[next]);
      return next;
    });
  }

  function handleTab(currentInput: string): string {
    const parts = currentInput.split(/\s+/);
    const isFirstWord = parts.length <= 1;
    const partial = parts[parts.length - 1] || '';

    let completions: string[];

    if (isFirstWord) {
      completions = COMMAND_NAMES.filter((name) => name.startsWith(partial)).sort();
    } else {
      completions = fs.completePath(cwd, partial);
    }

    if (completions.length === 0) {
      setTabCompletions(null);
      return currentInput;
    }

    if (completions.length === 1) {
      const completed = completions[0];
      const prefix = parts.slice(0, -1).join(' ');
      const newInput = prefix ? `${prefix} ${completed}` : completed;
      setTabCompletions(null);
      return newInput;
    }

    // multiple completions - find common prefix and show options
    const commonPrefix = findCommonPrefix(completions);
    if (commonPrefix.length > partial.length) {
      const prefix = parts.slice(0, -1).join(' ');
      setTabCompletions(completions);
      return prefix ? `${prefix} ${commonPrefix}` : commonPrefix;
    }

    setTabCompletions(completions);
    return currentInput;
  }

  function vimSave(filePath: string, content: string): string | null {
    return fs.writeFile('~', filePath, content);
  }

  function vimQuit() {
    setVimRequest(null);
  }

  function donutQuit() {
    setDonutActive(false);
  }

  function cancelHeredoc() {
    heredocRef.current = null;
    setHeredocActive(false);
  }

  return {
    lines,
    cwd,
    inputValue,
    setInputValue,
    submitCommand,
    navigateHistory,
    handleTab,
    tabCompletions,
    setTabCompletions,
    vimRequest,
    vimSave,
    vimQuit,
    donutActive,
    donutQuit,
    heredocActive,
    cancelHeredoc,
  };
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

/** Detect `<< DELIMITER` pattern and extract the command + delimiter */
function detectHeredoc(input: string): {command: string; delimiter: string} | null {
  const match = input.match(/(^|\s)(<<-?\s*['"]?(\w+)['"]?)/);
  if (!match) return null;

  const delimiter = match[3];
  const command = input.replace(match[2], '').trim();

  return {command, delimiter};
}
