'use client';

import {createContext, use, useRef, type ReactNode} from 'react';

import {useChat} from '@ai-sdk/react';
import {useStore, type StoreApi} from 'zustand';

import {createChatStore, type ChatStore} from './chat-store';

const ChatContext = createContext<StoreApi<ChatStore> | null>(null);

export function ChatProvider({children}: {children: ReactNode}) {
  const chat = useChat({
    onError(err) {
      try {
        const parsed = JSON.parse(err.message);
        storeRef.current?.setState({error: parsed.error ?? err.message});
      } catch {
        storeRef.current?.setState({error: err.message});
      }
    },
    onFinish() {
      storeRef.current?.setState({error: null});
    },
  });

  const storeRef = useRef<StoreApi<ChatStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createChatStore({
      sendMessage: (text, headers) => chat.sendMessage({text}, {headers}),
      getStatus: () => chat.status,
      getMessages: () => chat.messages,
      setError: (error) => storeRef.current?.setState({error}),
    });
  }

  // Sync useChat state → store
  const store = storeRef.current;
  const isLoading = chat.status === 'submitted' || chat.status === 'streaming';
  store.setState({messages: chat.messages, isLoading});

  return <ChatContext value={store}>{children}</ChatContext>;
}

export function useChatStore<T>(selector: (state: ChatStore) => T): T {
  const store = use(ChatContext);
  if (!store) throw new Error('useChatStore must be used within ChatProvider');
  return useStore(store, selector);
}
