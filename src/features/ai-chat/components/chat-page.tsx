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
    <>
      <main className={`mx-auto w-full max-w-3xl px-4 ${isEmpty ? '' : 'pb-32'}`}>
        {isEmpty ? (
          <div className="flex h-[calc(100dvh-10rem)] flex-col items-center justify-center gap-8">
            <ChatSuggestions />
          </div>
        ) : (
          <ChatMessages />
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10">
        <div className="pointer-events-none h-8 bg-gradient-to-t from-background to-transparent" />
        <div className="bg-background pb-4">
          <div className="mx-auto w-full max-w-3xl px-4">
            <ChatInput />
          </div>
        </div>
      </div>
    </>
  );
}
