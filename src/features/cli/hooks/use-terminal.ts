'use client';

import {useCallback, useMemo, useRef, useState} from 'react';

import {COMMAND_NAMES} from '../utils/commands';
import {execute} from '../utils/executor';
import {VirtualFS} from '../utils/filesystem';

import type {CliData, TerminalLine} from '../types';

const WELCOME_MESSAGE = [
  '',
  '  ██╗  ██╗ ██████╗ ███╗   ██╗ ██████╗',
  '  ██║  ██║██╔═══██╗████╗  ██║██╔════╝',
  '  ███████║██║   ██║██╔██╗ ██║██║  ███╗',
  '  ██╔══██║██║   ██║██║╚██╗██║██║   ██║',
  '  ██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝',
  '  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝',
  '',
  '  Welcome to hongsoohyuk.com',
  '  Type "help" for available commands.',
  '  Type "ls" to see available directories.',
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
  const fs = useMemo(() => new VirtualFS(cliData), [cliData]);

  const [lines, setLines] = useState<TerminalLine[]>([{id: 'welcome', output: WELCOME_MESSAGE}]);
  const [cwd, setCwd] = useState('~');
  const [env, setEnv] = useState<Record<string, string>>(DEFAULT_ENV);
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const commandHistory = useRef<string[]>([]);
  const [tabCompletions, setTabCompletions] = useState<string[] | null>(null);

  const submitCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      const lineId = `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      setTabCompletions(null);

      if (!trimmed) {
        setLines((prev) => [...prev, {id: lineId, command: '', output: '', cwd}]);
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
    },
    [fs, cwd, env],
  );

  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      const history = commandHistory.current;
      if (history.length === 0) return;

      setTabCompletions(null);

      if (direction === 'up') {
        const newIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIdx);
        setInputValue(history[newIdx]);
      } else {
        if (historyIndex <= 0) {
          setHistoryIndex(-1);
          setInputValue('');
        } else {
          const newIdx = historyIndex - 1;
          setHistoryIndex(newIdx);
          setInputValue(history[newIdx]);
        }
      }
    },
    [historyIndex],
  );

  const handleTab = useCallback(
    (currentInput: string): string => {
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
    },
    [fs, cwd],
  );

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
