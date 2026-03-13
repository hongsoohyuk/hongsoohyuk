'use client';

import { useSyncExternalStore } from 'react';

import { detectWebView } from './detect';

import type { WebViewInfo } from './detect';

const EMPTY: WebViewInfo = { isWebView: false, platform: 'unknown' };

let cached: WebViewInfo | null = null;

function getSnapshot(): WebViewInfo {
  if (!cached) {
    cached = detectWebView();
  }
  return cached;
}

function getServerSnapshot(): WebViewInfo {
  return EMPTY;
}

function subscribe(_onStoreChange: () => void): () => void {
  // 웹뷰 여부는 런타임 중 변하지 않으므로 구독 불필요
  return () => {};
}

/**
 * 현재 환경이 웹뷰인지 반환하는 훅
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { isWebView } = useWebView();
 *   if (isWebView) return null; // 웹뷰에서는 헤더 숨김
 *   return <header>...</header>;
 * }
 * ```
 */
export function useWebView(): WebViewInfo {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
