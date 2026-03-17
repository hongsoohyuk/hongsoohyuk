'use client';

import {useEffect, useRef, type KeyboardEvent} from 'react';

import {DonutAnimation} from './donut-animation';
import {VimEditor} from './vim-editor';

import {useTerminalStore} from '../stores/terminal-provider';

function Prompt({cwd}: {cwd: string}) {
  return (
    <span className="shrink-0 select-none">
      <span className="text-green-400">guest</span>
      <span className="text-neutral-500">@</span>
      <span className="text-blue-400">hongsoohyuk</span>
      <span className="text-purple-400 "> {cwd} </span>
      <span className="text-neutral-500 whitespace-pre">$ </span>
    </span>
  );
}

export function Terminal() {
  const lines = useTerminalStore((s) => s.lines);
  const cwd = useTerminalStore((s) => s.cwd);
  const inputValue = useTerminalStore((s) => s.inputValue);
  const tabCompletions = useTerminalStore((s) => s.tabCompletions);
  const mode = useTerminalStore((s) => s.mode);

  const setInput = useTerminalStore((s) => s.setInput);
  const submitCommand = useTerminalStore((s) => s.submitCommand);
  const navigateHistory = useTerminalStore((s) => s.navigateHistory);
  const handleTab = useTerminalStore((s) => s.handleTab);
  const clearTabCompletions = useTerminalStore((s) => s.clearTabCompletions);
  const vimSave = useTerminalStore((s) => s.vimSave);
  const exitMode = useTerminalStore((s) => s.exitMode);
  const cancelHeredoc = useTerminalStore((s) => s.cancelHeredoc);
  const cancelAsk = useTerminalStore((s) => s.cancelAsk);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAskStreaming = mode.type === 'ask' && mode.streaming;

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, tabCompletions, isAskStreaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isAskStreaming]);

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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const newInput = handleTab(inputValue);
      setInput(newInput);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      submitCommand('clear');
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setInput('');
      clearTabCompletions();
      if (mode.type === 'ask') cancelAsk();
      if (mode.type === 'heredoc') cancelHeredoc();
    } else {
      if (tabCompletions) clearTabCompletions();
    }
  }

  function handleContainerClick() {
    inputRef.current?.focus();
  }

  if (mode.type === 'vim') {
    return <VimEditor request={mode.request} onSave={vimSave} onQuit={exitMode} />;
  }

  if (mode.type === 'donut') {
    return <DonutAnimation onQuit={exitMode} />;
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="h-full overflow-y-auto bg-neutral-950 text-neutral-200 font-mono text-sm leading-relaxed p-4 cursor-text"
    >
      {lines.map((line) => (
        <div key={line.id} className="whitespace-pre-wrap break-words">
          {line.command !== undefined && (
            <div className="flex">
              <Prompt cwd={line.cwd ?? '~'} />
              <span>{line.command}</span>
            </div>
          )}
          {line.output && (
            <div
              className={
                line.isError
                  ? 'text-red-400'
                  : line.role === 'user'
                    ? 'text-cyan-400'
                    : line.role === 'assistant'
                      ? 'text-green-400'
                      : 'text-neutral-300'
              }
            >
              {line.output}
            </div>
          )}
        </div>
      ))}

      {isAskStreaming ? (
        <div className="flex items-center text-neutral-500">
          <span className="shrink-0 select-none whitespace-pre">응답 대기 중</span>
          <span className="inline-flex gap-0.5 ml-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          {mode.type === 'ask' ? (
            <span className="shrink-0 select-none text-cyan-400 whitespace-pre">you: </span>
          ) : mode.type === 'heredoc' ? (
            <span className="shrink-0 select-none text-neutral-500 whitespace-pre">&gt; </span>
          ) : (
            <Prompt cwd={cwd} />
          )}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none text-neutral-200 font-mono text-base caret-green-400"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminal input"
          />
        </div>
      )}

      {tabCompletions && tabCompletions.length > 0 && (
        <div className="text-cyan-400 whitespace-pre-wrap">{tabCompletions.join('  ')}</div>
      )}
    </div>
  );
}
