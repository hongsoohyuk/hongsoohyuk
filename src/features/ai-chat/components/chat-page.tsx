'use client';

import {useChatState, ChatProvider} from '../stores/chat-provider';

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
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4">
          {isEmpty ? (
            <div className="flex h-full min-h-[60dvh] flex-col items-center justify-center gap-8">
              <ChatSuggestions />
            </div>
          ) : (
            <ChatMessages />
          )}
        </div>
      </div>

      <div className="shrink-0 pb-safe">
        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          <ChatError />
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
