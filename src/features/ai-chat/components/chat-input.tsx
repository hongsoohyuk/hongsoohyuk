'use client';

import type {KeyboardEvent} from 'react';
import {useEffect, useRef} from 'react';

import {ArrowUp} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {Button} from '@/components/ui/button';

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  onInputChange(value: string): void;
  onSubmit(e?: {preventDefault?: () => void}): void;
};

const MAX_ROWS = 5;

export function ChatInput({input, isLoading, onInputChange, onSubmit}: ChatInputProps) {
  const t = useTranslations('AiChat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative flex items-end gap-2 rounded-2xl border bg-background px-4 py-3 shadow-sm"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('placeholder')}
        disabled={isLoading}
        rows={1}
        className="scrollbar-thin flex-1 resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
      <Button
        type="submit"
        size="icon"
        className="size-8 shrink-0 rounded-full"
        disabled={!input.trim() || isLoading}
        aria-label={t('send')}
      >
        <ArrowUp className="size-4" />
      </Button>
    </form>
  );
}
