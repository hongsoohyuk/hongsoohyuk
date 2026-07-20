'use client';

import {PageContainer} from '@/components/layout/page-container';

import {ChatError} from './chat-error';
import {ChatInput} from './chat-input';
import {ChatMessages} from './chat-messages';
import {ChatSuggestions} from './chat-suggestions';
import {useChatState, ChatProvider} from '../_lib/chat-provider';

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
        <PageContainer>
          {isEmpty ? (
            <div className="flex h-full min-h-[60dvh] flex-col items-center justify-center gap-8">
              <ChatSuggestions />
            </div>
          ) : (
            <ChatMessages />
          )}
        </PageContainer>
      </div>

      <div className="shrink-0 pb-safe">
        <PageContainer className="pb-4">
          <ChatError />
          <ChatInput />
        </PageContainer>
      </div>
    </div>
  );
}
