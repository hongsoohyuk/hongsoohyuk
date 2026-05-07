'use client';

import {startTransition} from 'react';

import {useRouter, useSearchParams} from 'next/navigation';

import {DEFAULT_PAGE, PAGINATION_PARAMETER_PAGE} from '@/lib/api/pagination';

import {EMOTION_SET, type EmotionCode} from './emotion';

const EMOTION_PARAM = 'emotion';

export function useGuestbookFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawEmotion = searchParams?.get(EMOTION_PARAM);
  const selectedEmotion =
    rawEmotion && EMOTION_SET.has(rawEmotion as EmotionCode) ? (rawEmotion as EmotionCode) : null;

  const rawPage = Number(searchParams?.get(PAGINATION_PARAMETER_PAGE));
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : DEFAULT_PAGE;

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `?${query}` : '?', {scroll: false});
    });
  };

  const toggleEmotion = (code: EmotionCode) => {
    updateParams({
      [EMOTION_PARAM]: selectedEmotion === code ? null : code,
      [PAGINATION_PARAMETER_PAGE]: null,
    });
  };

  const clearEmotion = () => {
    updateParams({
      [EMOTION_PARAM]: null,
      [PAGINATION_PARAMETER_PAGE]: null,
    });
  };

  return {selectedEmotion, currentPage, toggleEmotion, clearEmotion};
}
