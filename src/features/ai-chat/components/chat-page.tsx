'use client';

import {useChatStore, ChatProvider} from '../stores/chat-provider';

import {ChatInput} from './chat-input';
import {ChatMessages} from './chat-messages';
import {ChatSuggestions} from './chat-suggestions';

export function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageLayout />
    </ChatProvider>
  );
}

function ChatPageLayout() {
  const isEmpty = useChatStore((s) => s.messages.length === 0);

  return (
    <main className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4">
      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <ChatSuggestions />
        </div>
      ) : (
        <ChatMessages />
      )}

      <div className="shrink-0 pb-4 pt-2">
        <ChatInput />
      </div>
    </main>
  );
}
