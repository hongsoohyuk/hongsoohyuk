'use client';

import {useEffect, useRef} from 'react';

import {Bot} from 'lucide-react';

import type {ChatMessage} from '../types';
import {useChatState, useChatStore} from '../stores/chat-provider';

function getTextContent(message: ChatMessage): string {
  return message.parts
    .filter((p): p is {type: 'text'; text: string} => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderTextWithLinks(text: string) {
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MD_LINK_RE)) {
    const [full, label, href] = match;
    const index = match.index!;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    parts.push(
      <a key={index} href={href} className="underline underline-offset-2 hover:text-primary">
        {label}
      </a>,
    );
    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function ChatMessages() {
  const {messages} = useChatState();
  const isLoading = useChatStore((s) => s.isLoading);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  return (
    <div className="py-6">
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
              {message.role === 'assistant'
                ? renderTextWithLinks(getTextContent(message))
                : getTextContent(message)}
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
      <div ref={bottomRef} />
    </div>
  );
}
