'use client';

import type {KeyboardEvent} from 'react';
import {useEffect, useRef} from 'react';

import {ArrowUp, Check, ChevronDown} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type {GeminiModel} from '../stores/chat-store';
import {useChatStore} from '../stores/chat-provider';

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

const MAX_ROWS = 5;

export function ChatInput() {
  const t = useTranslations('AiChat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineHeightRef = useRef<number>(0);

  const input = useChatStore((s) => s.input);
  const isLoading = useChatStore((s) => s.isLoading);
  const model = useChatStore((s) => s.model);
  const setInput = useChatStore((s) => s.setInput);
  const setModel = useChatStore((s) => s.setModel);
  const sendMessage = useChatStore((s) => s.sendMessage);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (lineHeightRef.current === 0) {
      lineHeightRef.current = parseFloat(getComputedStyle(el).lineHeight);
    }
    el.style.height = 'auto';
    const maxHeight = lineHeightRef.current * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        sendMessage(input);
      }
    }
  };

  const handleSubmit = (e?: {preventDefault?: () => void}) => {
    e?.preventDefault?.();
    sendMessage(input);
  };

  const currentLabel = MODEL_OPTIONS.find((m) => m.id === model)?.label ?? 'Flash';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="relative flex flex-col gap-2 rounded-2xl border bg-background px-4 py-3 shadow-sm"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('placeholder')}
        disabled={isLoading}
        rows={1}
        className="scrollbar-thin w-full resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />

      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>{currentLabel}</span>
              <ChevronDown className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            {MODEL_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onSelect={() => setModel(option.id)}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {model === option.id && <Check className="size-4 shrink-0 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
