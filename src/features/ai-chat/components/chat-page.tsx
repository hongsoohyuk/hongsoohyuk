'use client';

import {useState} from 'react';

import {useChat} from '@ai-sdk/react';

import {ChatInput} from './chat-input';
import {ChatMessages} from './chat-messages';
import {ChatSuggestions} from './chat-suggestions';

export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro';

export function ChatPage() {
  const [model, setModel] = useState<GeminiModel>('gemini-2.5-flash');
  const [error, setError] = useState<string | null>(null);

  const {messages, sendMessage, status} = useChat({
    onError(err) {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.error ?? err.message);
      } catch {
        setError(err.message);
      }
    },
    onFinish() {
      setError(null);
    },
  });

  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';
  const isEmpty = messages.length === 0;

  const sendWithModel = (text: string) => {
    setError(null);
    sendMessage({text}, {headers: {'x-model': model}});
  };

  const handleSubmit = (e?: {preventDefault?: () => void}) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendWithModel(text);
  };

  const handleSuggestionClick = (text: string) => {
    if (isLoading) return;
    sendWithModel(text);
  };

  return (
    <main className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4">
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
        </div>
      ) : (
        <ChatMessages messages={messages} isLoading={isLoading} error={error} />
      )}

      <div className="shrink-0 pb-4 pt-2">
        <ChatInput
          input={input}
          isLoading={isLoading}
          model={model}
          onInputChange={setInput}
          onModelChange={setModel}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
