'use client';

import {useEffect, useRef} from 'react';

import {ChatAvatar, ChatBubble, ChatMessage} from './chat-message';
import {useChatState, useChatStore} from '../_lib/chat-provider';
import type {ChatMessage as ChatMessageData} from '../_lib/types';

function getTextContent(message: ChatMessageData): string {
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
          <ChatMessage key={message.id} role={message.role}>
            {message.role === 'assistant' ? renderTextWithLinks(getTextContent(message)) : getTextContent(message)}
          </ChatMessage>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3">
            <ChatAvatar />
            <ChatBubble variant="loading">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce [animation-delay:150ms]">·</span>
                <span className="animate-bounce [animation-delay:300ms]">·</span>
              </span>
            </ChatBubble>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
