'use client';

import {useEffect, useRef, type KeyboardEvent} from 'react';

import {useTerminal} from '../hooks/use-terminal';

import type {DirectoryNode} from '../types';

type Props = {
  fs: DirectoryNode;
};

function Prompt({cwd}: {cwd: string}) {
  return (
    <span className="shrink-0 select-none">
      <span className="text-green-400">guest</span>
      <span className="text-neutral-500">@</span>
      <span className="text-blue-400">hongsoohyuk</span>
      <span className="text-neutral-500">:</span>
      <span className="text-purple-400">{cwd}</span>
      <span className="text-neutral-500">$ </span>
    </span>
  );
}

export function Terminal({fs}: Props) {
  const {lines, cwd, inputValue, setInputValue, submitCommand, navigateHistory} = useTerminal(fs);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new output
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCommand(inputValue);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      submitCommand('clear');
    }
  }

  function handleContainerClick() {
    inputRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="h-full overflow-y-auto bg-neutral-950 text-neutral-200 font-mono text-sm leading-relaxed p-4 cursor-text"
    >
      {/* Output lines */}
      {lines.map((line) => (
        <div key={line.id} className="whitespace-pre-wrap break-words">
          {line.command !== undefined && (
            <div className="flex">
              <Prompt cwd={cwd} />
              <span>{line.command}</span>
            </div>
          )}
          {line.output && (
            <div className={line.isError ? 'text-red-400' : 'text-neutral-300'}>{line.output}</div>
          )}
        </div>
      ))}

      {/* Input line */}
      <div className="flex items-center">
        <Prompt cwd={cwd} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none text-neutral-200 font-mono text-sm caret-green-400"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
}
