'use client';

import {useEffect, useRef, useState, type KeyboardEvent} from 'react';

import type {VimOpenRequest} from '../types';

type VimMode = 'NORMAL' | 'INSERT' | 'COMMAND';

type Props = {
  request: VimOpenRequest;
  onSave(filePath: string, content: string): string | null;
  onQuit(): void;
};

export function VimEditor({request, onSave, onQuit}: Props) {
  const [lines, setLines] = useState<string[]>(() => {
    const split = request.content.split('\n');
    return split.length === 0 ? [''] : split;
  });
  const [cursorRow, setCursorRow] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [mode, setMode] = useState<VimMode>('NORMAL');
  const [commandBuffer, setCommandBuffer] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [modified, setModified] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Scroll cursor row into view
  useEffect(() => {
    if (!contentRef.current) return;
    const lineEl = contentRef.current.children[cursorRow] as HTMLElement | undefined;
    lineEl?.scrollIntoView({block: 'nearest'});
  }, [cursorRow]);

  function clampCol(row: number, col: number, insertMode: boolean): number {
    const lineLen = lines[row]?.length ?? 0;
    const max = insertMode ? lineLen : Math.max(0, lineLen - 1);
    return Math.min(col, max);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (mode === 'COMMAND') {
      handleCommandMode(e);
      return;
    }

    if (mode === 'INSERT') {
      handleInsertMode(e);
      return;
    }

    // NORMAL mode
    handleNormalMode(e);
  }

  function handleNormalMode(e: KeyboardEvent<HTMLDivElement>) {
    const key = e.key;

    switch (key) {
      case 'i':
        setMode('INSERT');
        setStatusMessage('');
        break;
      case 'a':
        setMode('INSERT');
        setCursorCol((col) => Math.min(col + 1, lines[cursorRow].length));
        setStatusMessage('');
        break;
      case 'o': {
        setMode('INSERT');
        const newRow = cursorRow + 1;
        setLines((prev) => [...prev.slice(0, newRow), '', ...prev.slice(newRow)]);
        setCursorRow(newRow);
        setCursorCol(0);
        setModified(true);
        setStatusMessage('');
        break;
      }
      case 'O': {
        setMode('INSERT');
        setLines((prev) => [...prev.slice(0, cursorRow), '', ...prev.slice(cursorRow)]);
        setCursorCol(0);
        setModified(true);
        setStatusMessage('');
        break;
      }
      case 'A':
        setMode('INSERT');
        setCursorCol(lines[cursorRow].length);
        setStatusMessage('');
        break;
      case ':':
        setMode('COMMAND');
        setCommandBuffer(':');
        break;
      case 'h':
      case 'ArrowLeft':
        setCursorCol((col) => Math.max(0, col - 1));
        break;
      case 'l':
      case 'ArrowRight':
        setCursorCol((col) => clampCol(cursorRow, col + 1, false));
        break;
      case 'k':
      case 'ArrowUp':
        setCursorRow((row) => {
          const newRow = Math.max(0, row - 1);
          setCursorCol((col) => clampCol(newRow, col, false));
          return newRow;
        });
        break;
      case 'j':
      case 'ArrowDown':
        setCursorRow((row) => {
          const newRow = Math.min(lines.length - 1, row + 1);
          setCursorCol((col) => clampCol(newRow, col, false));
          return newRow;
        });
        break;
      case '0':
        setCursorCol(0);
        break;
      case '$':
        setCursorCol(Math.max(0, lines[cursorRow].length - 1));
        break;
      case 'g':
        if (e.shiftKey) {
          // G = go to last line
          const lastRow = lines.length - 1;
          setCursorRow(lastRow);
          setCursorCol(clampCol(lastRow, 0, false));
        } else {
          // gg = go to first line (simplified: single g goes to top)
          setCursorRow(0);
          setCursorCol(clampCol(0, 0, false));
        }
        break;
      case 'x': {
        if (request.readonly) {
          setStatusMessage('E45: readonly option is set');
          break;
        }
        const line = lines[cursorRow];
        if (line.length === 0) break;
        setLines((prev) => {
          const updated = [...prev];
          updated[cursorRow] = line.slice(0, cursorCol) + line.slice(cursorCol + 1);
          return updated;
        });
        setCursorCol((col) => clampCol(cursorRow, col, false));
        setModified(true);
        break;
      }
      case 'd':
        if (e.shiftKey) {
          // D = delete to end of line
          if (request.readonly) {
            setStatusMessage('E45: readonly option is set');
            break;
          }
          setLines((prev) => {
            const updated = [...prev];
            updated[cursorRow] = prev[cursorRow].slice(0, cursorCol);
            return updated;
          });
          setCursorCol((col) => Math.max(0, col - 1));
          setModified(true);
        }
        break;
    }
  }

  function handleInsertMode(e: KeyboardEvent<HTMLDivElement>) {
    const key = e.key;

    if (key === 'Escape') {
      setMode('NORMAL');
      setCursorCol((col) => Math.max(0, col - 1));
      return;
    }

    if (request.readonly) {
      setStatusMessage('E45: readonly option is set');
      return;
    }

    if (key === 'ArrowLeft') {
      setCursorCol((col) => Math.max(0, col - 1));
      return;
    }
    if (key === 'ArrowRight') {
      setCursorCol((col) => clampCol(cursorRow, col + 1, true));
      return;
    }
    if (key === 'ArrowUp') {
      setCursorRow((row) => {
        const newRow = Math.max(0, row - 1);
        setCursorCol((col) => clampCol(newRow, col, true));
        return newRow;
      });
      return;
    }
    if (key === 'ArrowDown') {
      setCursorRow((row) => {
        const newRow = Math.min(lines.length - 1, row + 1);
        setCursorCol((col) => clampCol(newRow, col, true));
        return newRow;
      });
      return;
    }

    if (key === 'Enter') {
      setLines((prev) => {
        const line = prev[cursorRow];
        const before = line.slice(0, cursorCol);
        const after = line.slice(cursorCol);
        return [...prev.slice(0, cursorRow), before, after, ...prev.slice(cursorRow + 1)];
      });
      setCursorRow((row) => row + 1);
      setCursorCol(0);
      setModified(true);
      return;
    }

    if (key === 'Backspace') {
      if (cursorCol > 0) {
        setLines((prev) => {
          const line = prev[cursorRow];
          const updated = [...prev];
          updated[cursorRow] = line.slice(0, cursorCol - 1) + line.slice(cursorCol);
          return updated;
        });
        setCursorCol((col) => col - 1);
        setModified(true);
      } else if (cursorRow > 0) {
        // Merge with previous line
        const prevLineLen = lines[cursorRow - 1].length;
        setLines((prev) => {
          const merged = prev[cursorRow - 1] + prev[cursorRow];
          return [...prev.slice(0, cursorRow - 1), merged, ...prev.slice(cursorRow + 1)];
        });
        setCursorRow((row) => row - 1);
        setCursorCol(prevLineLen);
        setModified(true);
      }
      return;
    }

    if (key === 'Delete') {
      const line = lines[cursorRow];
      if (cursorCol < line.length) {
        setLines((prev) => {
          const updated = [...prev];
          updated[cursorRow] = line.slice(0, cursorCol) + line.slice(cursorCol + 1);
          return updated;
        });
        setModified(true);
      } else if (cursorRow < lines.length - 1) {
        // Merge with next line
        setLines((prev) => {
          const merged = prev[cursorRow] + prev[cursorRow + 1];
          return [...prev.slice(0, cursorRow), merged, ...prev.slice(cursorRow + 2)];
        });
        setModified(true);
      }
      return;
    }

    // Tab key
    if (key === 'Tab') {
      const tab = '  ';
      setLines((prev) => {
        const line = prev[cursorRow];
        const updated = [...prev];
        updated[cursorRow] = line.slice(0, cursorCol) + tab + line.slice(cursorCol);
        return updated;
      });
      setCursorCol((col) => col + 2);
      setModified(true);
      return;
    }

    // Printable character
    if (key.length === 1) {
      setLines((prev) => {
        const line = prev[cursorRow];
        const updated = [...prev];
        updated[cursorRow] = line.slice(0, cursorCol) + key + line.slice(cursorCol);
        return updated;
      });
      setCursorCol((col) => col + 1);
      setModified(true);
    }
  }

  function handleCommandMode(e: KeyboardEvent<HTMLDivElement>) {
    const key = e.key;

    if (key === 'Escape') {
      setMode('NORMAL');
      setCommandBuffer('');
      return;
    }

    if (key === 'Enter') {
      executeCommand(commandBuffer);
      return;
    }

    if (key === 'Backspace') {
      if (commandBuffer.length <= 1) {
        setMode('NORMAL');
        setCommandBuffer('');
        return;
      }
      setCommandBuffer((buf) => buf.slice(0, -1));
      return;
    }

    if (key.length === 1) {
      setCommandBuffer((buf) => buf + key);
    }
  }

  function executeCommand(cmd: string) {
    const stripped = cmd.slice(1).trim(); // remove leading ':'

    switch (stripped) {
      case 'q': {
        if (modified) {
          setStatusMessage('E37: No write since last change (add ! to override)');
          setMode('NORMAL');
          setCommandBuffer('');
          return;
        }
        onQuit();
        return;
      }
      case 'q!': {
        onQuit();
        return;
      }
      case 'w': {
        if (request.readonly) {
          setStatusMessage("E45: 'readonly' option is set (add ! to override)");
          setMode('NORMAL');
          setCommandBuffer('');
          return;
        }
        const content = lines.join('\n');
        const error = onSave(request.filePath, content);
        if (error) {
          setStatusMessage(error);
        } else {
          setStatusMessage(`"${request.fileName}" ${lines.length}L written`);
          setModified(false);
        }
        setMode('NORMAL');
        setCommandBuffer('');
        return;
      }
      case 'wq': {
        if (request.readonly) {
          setStatusMessage("E45: 'readonly' option is set (add ! to override)");
          setMode('NORMAL');
          setCommandBuffer('');
          return;
        }
        const content = lines.join('\n');
        const error = onSave(request.filePath, content);
        if (error) {
          setStatusMessage(error);
          setMode('NORMAL');
          setCommandBuffer('');
          return;
        }
        onQuit();
        return;
      }
      default:
        setStatusMessage(`E492: Not an editor command: ${stripped}`);
        setMode('NORMAL');
        setCommandBuffer('');
    }
  }

  const gutterWidth = String(lines.length).length;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between bg-neutral-800 px-3 py-1 text-neutral-400 text-xs">
        <span>
          {request.filePath}
          {modified && ' [+]'}
          {request.readonly && ' [readonly]'}
        </span>
      </div>

      {/* Content area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-0">
        {lines.map((line, rowIdx) => (
          <div key={rowIdx} className="flex leading-relaxed">
            {/* Line number */}
            <span
              className="shrink-0 select-none text-neutral-600 text-right px-2"
              style={{minWidth: `${gutterWidth + 2}ch`}}
            >
              {rowIdx + 1}
            </span>
            {/* Line content */}
            <span className="whitespace-pre flex-1">
              {rowIdx === cursorRow ? (
                <>
                  {line.slice(0, cursorCol)}
                  <span className={mode === 'INSERT' ? 'border-l-2 border-green-400' : 'bg-green-400 text-neutral-950'}>
                    {mode === 'INSERT' ? '' : line[cursorCol] || ' '}
                  </span>
                  {mode === 'INSERT' ? line.slice(cursorCol) : line.slice(cursorCol + 1)}
                </>
              ) : (
                line || '\u200B'
              )}
            </span>
          </div>
        ))}
        {/* Fill remaining space with ~ lines */}
        <EmptyLines count={20} gutterWidth={gutterWidth} />
      </div>

      {/* Status bar */}
      <div className="shrink-0 bg-neutral-800 px-3 py-1 flex items-center justify-between text-xs">
        <span
          className={
            mode === 'COMMAND'
              ? 'text-neutral-200'
              : mode === 'INSERT'
                ? 'text-green-400 font-bold'
                : 'text-neutral-400'
          }
        >
          {mode === 'COMMAND' ? commandBuffer : mode === 'INSERT' ? '-- INSERT --' : statusMessage || 'NORMAL'}
        </span>
        <span className="text-neutral-500">
          {cursorRow + 1}:{cursorCol + 1}
        </span>
      </div>
    </div>
  );
}

function EmptyLines({count, gutterWidth}: {count: number; gutterWidth: number}) {
  const tildes = [];
  for (let i = 0; i < count; i++) {
    tildes.push(
      <div key={`tilde-${i}`} className="flex leading-relaxed">
        <span className="shrink-0 select-none text-blue-500 text-right px-2" style={{minWidth: `${gutterWidth + 2}ch`}}>
          ~
        </span>
      </div>,
    );
  }
  return <>{tildes}</>;
}
