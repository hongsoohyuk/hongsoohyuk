'use client';

import {useState} from 'react';

import {useChat} from '@ai-sdk/react';

import {ChatInput} from './chat-input';
import {ChatMessages} from './chat-messages';
import {ChatSuggestions} from './chat-suggestions';

export function ChatPage() {
  const {messages, sendMessage, status} = useChat();
  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';
  const isEmpty = messages.length === 0;

  const handleSubmit = (e?: {preventDefault?: () => void}) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({text});
  };

  const handleSuggestionClick = (text: string) => {
    if (isLoading) return;
    sendMessage({text});
  };

  return (
    <main className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4">
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
        </div>
      ) : (
        <ChatMessages messages={messages} isLoading={isLoading} />
      )}

      <div className="shrink-0 pb-4 pt-2">
        <ChatInput input={input} isLoading={isLoading} onInputChange={setInput} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
