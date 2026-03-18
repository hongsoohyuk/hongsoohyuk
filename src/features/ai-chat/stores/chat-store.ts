'use client';

import {createStore} from 'zustand';

export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro';

type ChatState = {
  model: GeminiModel;
  input: string;
  isLoading: boolean;
  error: string | null;
};

type ChatActions = {
  setInput: (value: string) => void;
  setModel: (model: GeminiModel) => void;
  sendMessage: (text: string) => void;
};

export type ChatStore = ChatState & ChatActions;

type ChatDeps = {
  sendMessage: (text: string, headers: Record<string, string>) => void;
  setError: (error: string | null) => void;
};

export function createChatStore(deps: ChatDeps) {
  return createStore<ChatStore>((set, get) => ({
    // State
    model: 'gemini-2.5-flash' as GeminiModel,
    input: '',
    isLoading: false,
    error: null,

    // Actions
    setInput: (value) => set({input: value}),
    setModel: (model) => set({model}),

    sendMessage: (text) => {
      const {model, isLoading} = get();
      if (!text.trim() || isLoading) return;
      set({input: '', error: null, isLoading: true});
      deps.sendMessage(text, {'x-model': model});
    },
  }));
}
