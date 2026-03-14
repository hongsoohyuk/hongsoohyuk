'use client';

import {useState} from 'react';

import {useChat} from '@ai-sdk/react';
import {Bot} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {ChatInput} from './chat-input';
import {ChatMessages} from './chat-messages';

export function ChatPage() {
  const t = useTranslations('AiChat');
  const {messages, sendMessage, status} = useChat();
  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e?: {preventDefault?: () => void}) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({text});
  };

  return (
    <main className="mx-auto flex h-[calc(100dvh-8rem)] w-full max-w-2xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">{t('assistant')}</h1>
          <p className="text-sm text-muted-foreground">{t('pageDescription')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 rounded-2xl border bg-background">
        <div className="flex h-full flex-col">
          <ChatMessages messages={messages} isLoading={isLoading} />
          <ChatInput input={input} isLoading={isLoading} onInputChange={setInput} onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  );
}
