'use client';

import {useEffect, useRef} from 'react';

import {ScrollArea} from '@/components/ui/scroll-area';

import {useTranslations} from 'next-intl';
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  return (
    <ScrollArea className="flex-1 px-4 py-3">
      {messages.length === 0 && <HelloMessage />}
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
            >
              {getTextContent(message)}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-3 py-2 text-sm">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce [animation-delay:150ms]">·</span>
                <span className="animate-bounce [animation-delay:300ms]">·</span>
              </span>
            </div>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </ScrollArea>
  );
}

function HelloMessage() {
  const t = useTranslations('AiChat');
  return <p className="text-muted-foreground text-center text-sm mt-8">{t('hello')}</p>;
}
