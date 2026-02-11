'use client';

import type {KeyboardEvent} from 'react';

import {SendHorizontal} from 'lucide-react';

import {Button} from '@/components/ui/button';

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  onInputChange(value: string): void;
  onSubmit(e?: {preventDefault?: () => void}): void;
};

export function ChatInput({input, isLoading, onInputChange, onSubmit}: ChatInputProps) {
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
      className="border-t p-3 flex gap-2 items-end"
    >
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        disabled={isLoading}
        rows={1}
        className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50"
      />
      <Button type="submit" size="icon-sm" disabled={!input.trim() || isLoading} aria-label="전송">
        <SendHorizontal className="size-4" />
      </Button>
    </form>
  );
}
