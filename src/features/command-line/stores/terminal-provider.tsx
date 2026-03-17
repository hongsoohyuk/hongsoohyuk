'use client';

import {createContext, use, useRef, type ReactNode} from 'react';

import {useStore, type StoreApi} from 'zustand';

import type {CliData} from '../types';

import {createTerminalStore, type TerminalStore} from './terminal-store';

const TerminalContext = createContext<StoreApi<TerminalStore> | null>(null);

export function TerminalProvider({cliData, children}: {cliData: CliData; children: ReactNode}) {
  const storeRef = useRef<StoreApi<TerminalStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createTerminalStore(cliData);
  }
  return <TerminalContext value={storeRef.current}>{children}</TerminalContext>;
}

export function useTerminalStore<T>(selector: (state: TerminalStore) => T): T {
  const store = use(TerminalContext);
  if (!store) throw new Error('useTerminalStore must be used within TerminalProvider');
  return useStore(store, selector);
}
