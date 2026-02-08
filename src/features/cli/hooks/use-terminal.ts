'use client';

import {useCallback, useRef, useState} from 'react';

import {executeCommand} from '../utils/commands';

import type {DirectoryNode, TerminalLine} from '../types';

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

const MAX_HISTORY = 100;

export function useTerminal(fs: DirectoryNode) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {id: 'welcome', output: WELCOME_MESSAGE},
  ]);
  const [cwd, setCwd] = useState('~');
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const commandHistory = useRef<string[]>([]);

  const submitCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      const lineId = `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      if (!trimmed) {
        setLines((prev) => [...prev, {id: lineId, command: '', output: ''}]);
        setInputValue('');
        return;
      }

      // Add to command history
      commandHistory.current = [trimmed, ...commandHistory.current].slice(0, MAX_HISTORY);
      setHistoryIndex(-1);

      const result = executeCommand(trimmed, {fs, cwd});

      if (result.clear) {
        setLines([]);
        setInputValue('');
        if (result.newCwd) setCwd(result.newCwd);
        return;
      }

      setLines((prev) => [
        ...prev,
        {
          id: lineId,
          command: trimmed,
          output: result.output,
          isError: result.isError,
        },
      ]);

      if (result.newCwd) {
        setCwd(result.newCwd);
      }

      setInputValue('');
    },
    [fs, cwd],
  );

  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      const history = commandHistory.current;
      if (history.length === 0) return;

      if (direction === 'up') {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setInputValue(history[newIndex]);
      } else {
        if (historyIndex <= 0) {
          setHistoryIndex(-1);
          setInputValue('');
        } else {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInputValue(history[newIndex]);
        }
      }
    },
    [historyIndex],
  );

  return {
    lines,
    cwd,
    inputValue,
    setInputValue,
    submitCommand,
    navigateHistory,
  };
}
