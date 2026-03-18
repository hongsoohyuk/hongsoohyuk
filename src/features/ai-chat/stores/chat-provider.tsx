'use client';

import {createContext, use, useRef, type ReactNode} from 'react';

import type {UIMessage} from 'ai';
import {useChat} from '@ai-sdk/react';
import {useStore, type StoreApi} from 'zustand';

import {createChatStore, type ChatStore} from './chat-store';

type ChatStateValue = {
  messages: UIMessage[];
  streamError: Error | undefined;
};

const ChatStoreContext = createContext<StoreApi<ChatStore> | null>(null);
const ChatStateContext = createContext<ChatStateValue>({messages: [], streamError: undefined});

export function ChatProvider({children}: {children: ReactNode}) {
  const storeRef = useRef<StoreApi<ChatStore>>(null);
  const chatRef = useRef<ReturnType<typeof useChat>>(null!);

  const chat = useChat({
    onError(err) {
      let errorText: string;
      try {
        const parsed = JSON.parse(err.message);
        errorText = parsed.errorText ?? parsed.error ?? err.message;
      } catch {
        errorText = err.message;
      }

      if (errorText.includes('quota') || errorText.includes('rate_limit') || errorText.includes('429')) {
        errorText = '현재 모델의 요청 한도에 도달했습니다. 다른 모델로 변경해주세요.';
      }

      storeRef.current?.setState({error: errorText, isLoading: false});
    },
    onFinish() {
      storeRef.current?.setState({error: null, isLoading: false});
    },
  });

  chatRef.current = chat;

  if (!storeRef.current) {
    storeRef.current = createChatStore({
      sendMessage: (text, headers) => chatRef.current.sendMessage({text}, {headers}),
      setError: (error) => storeRef.current?.setState({error}),
    });
  }

  return (
    <ChatStoreContext value={storeRef.current}>
      <ChatStateContext value={{messages: chat.messages, streamError: chat.error}}>
        {children}
      </ChatStateContext>
    </ChatStoreContext>
  );
}

export function useChatStore<T>(selector: (state: ChatStore) => T): T {
  const store = use(ChatStoreContext);
  if (!store) throw new Error('useChatStore must be used within ChatProvider');
  return useStore(store, selector);
}

export function useChatState(): ChatStateValue {
  return use(ChatStateContext);
}
