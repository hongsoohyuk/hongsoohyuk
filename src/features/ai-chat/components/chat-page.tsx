'use client';

import {useChatState, useChatStore, ChatProvider} from '../stores/chat-provider';

import {ChatError} from './chat-error';
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
  const {messages} = useChatState();
  const isEmpty = messages.length === 0;

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

      <div className="fixed inset-x-0 bottom-0 z-10 pb-8">
        <div className="mx-auto w-full max-w-3xl px-4">
          <ChatError />
          <ChatInput />
        </div>
      </div>
    </>
  );
}
