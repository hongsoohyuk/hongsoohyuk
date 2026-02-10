'use client';

import {useEffect, useRef, useState} from 'react';

import {useChat} from '@ai-sdk/react';
import {MessageCircle, X} from 'lucide-react';

import {Button} from '@/components/ui/button';

import {ChatInput} from './chat-input';
import {ChatMessages} from './chat-messages';

export function ChatFloater() {
  const [isOpen, setIsOpen] = useState(false);
  const {messages, sendMessage, status} = useChat();
  const [input, setInput] = useState('');
  const pendingMessageRef = useRef<string | null>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e?: {preventDefault?: () => void}) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({text});
  };

  useEffect(() => {
    if (pendingMessageRef.current && isOpen && status === 'ready') {
      const text = pendingMessageRef.current;
      pendingMessageRef.current = null;
      setInput('');
      sendMessage({text});
    }
  }, [isOpen, status, sendMessage]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{message?: string}>).detail;
      setIsOpen(true);
      if (detail?.message) {
        pendingMessageRef.current = detail.message;
      }
    };

    window.addEventListener('open-ai-chat', handler);
    return () => window.removeEventListener('open-ai-chat', handler);
  }, []);

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[360px] flex-col rounded-2xl border bg-background shadow-xl sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">AI 어시스턴트</span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)} aria-label="채팅 닫기">
              <X className="size-4" />
            </Button>
          </div>

          {/* Messages */}
          <ChatMessages messages={messages} isLoading={isLoading} />

          {/* Input */}
          <ChatInput input={input} isLoading={isLoading} onInputChange={setInput} onSubmit={handleSubmit} />
        </div>
      )}

      {/* FAB button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        size="icon-lg"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg sm:right-6"
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
      >
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </>
  );
}
