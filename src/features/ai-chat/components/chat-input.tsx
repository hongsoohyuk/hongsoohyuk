'use client';

import type {KeyboardEvent} from 'react';
import {useEffect, useRef, useState} from 'react';

import {ArrowUp, Check, ChevronDown} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {Button} from '@/components/ui/button';

import type {GeminiModel} from './chat-page';

type ModelOption = {
  id: GeminiModel;
  label: string;
  description: string;
};

const MODEL_OPTIONS: ModelOption[] = [
  {id: 'gemini-2.5-flash', label: 'Flash', description: '빠르고 균형 잡힌 응답'},
  {id: 'gemini-2.5-flash-lite', label: 'Flash Lite', description: '가볍고 빠른 응답'},
  {id: 'gemini-2.5-pro', label: 'Pro', description: '깊이 있는 사고와 분석'},
];

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  model: GeminiModel;
  onInputChange(value: string): void;
  onModelChange(model: GeminiModel): void;
  onSubmit(e?: {preventDefault?: () => void}): void;
};

const MAX_ROWS = 5;

export function ChatInput({input, isLoading, model, onInputChange, onModelChange, onSubmit}: ChatInputProps) {
  const t = useTranslations('AiChat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [input]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const currentLabel = MODEL_OPTIONS.find((m) => m.id === model)?.label ?? 'Flash';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative flex flex-col gap-2 rounded-2xl border bg-background px-4 py-3 shadow-sm"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('placeholder')}
        disabled={isLoading}
        rows={1}
        className="scrollbar-thin w-full resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />

      <div className="flex items-center justify-end gap-2">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>{currentLabel}</span>
            <ChevronDown className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute bottom-full right-0 mb-2 w-56 rounded-xl border bg-background p-1 shadow-lg">
              {MODEL_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onModelChange(option.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                  {model === option.id && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          size="icon"
          className="size-8 shrink-0 rounded-full"
          disabled={!input.trim() || isLoading}
          aria-label={t('send')}
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </form>
  );
}
