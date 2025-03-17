'use client';

import {useEffect, useRef} from 'react';

import {AlertCircle, Bot} from 'lucide-react';

import type {ChatMessage} from '../types';
import {useChatStore} from '../stores/chat-provider';

function getTextContent(message: ChatMessage): string {
  return message.parts
    .filter((p): p is {type: 'text'; text: string} => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export function ChatMessages() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, error]);

  return (
    <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto py-6">
      <div className="space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message-item flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {message.role === 'assistant' && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
                <Bot className="size-4" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-foreground'
              }`}
            >
              {getTextContent(message)}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
              <Bot className="size-4" />
            </div>
            <div className="bg-muted/50 rounded-2xl px-4 py-3 text-sm">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce [animation-delay:150ms]">·</span>
                <span className="animate-bounce [animation-delay:300ms]">·</span>
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
              <AlertCircle className="size-4 text-destructive" />
            </div>
            <div className="max-w-[75%] rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
