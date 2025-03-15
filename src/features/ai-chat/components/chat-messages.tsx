'use client';

import {useEffect, useRef} from 'react';

import {Bot} from 'lucide-react';

import type {ChatMessage} from '../types';

type ChatMessagesProps = {
  messages: ChatMessage[];
  isLoading: boolean;
};

function getTextContent(message: ChatMessage): string {
  return message.parts
    .filter((p): p is {type: 'text'; text: string} => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export function ChatMessages({messages, isLoading}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto py-6">
      <div className="space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
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
      </div>
    </div>
  );
}
