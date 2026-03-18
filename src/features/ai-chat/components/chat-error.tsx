'use client';

import {AlertCircle} from 'lucide-react';

import {useChatState, useChatStore} from '../stores/chat-provider';

function formatError(streamError: Error | undefined, storeError: string | null): string | null {
  const raw = storeError ?? streamError?.message ?? null;
  if (!raw) return null;
  if (raw.includes('quota') || raw.includes('rate_limit') || raw.includes('429')) {
    return '현재 모델의 요청 한도에 도달했습니다. 다른 모델로 변경해주세요.';
  }
  return raw;
}

export function ChatError() {
  const {streamError} = useChatState();
  const storeError = useChatStore((s) => s.error);
  const error = formatError(streamError, storeError);

  if (!error) return null;

  return (
    <div className="mb-2 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" />
      <span>{error}</span>
    </div>
  );
}
