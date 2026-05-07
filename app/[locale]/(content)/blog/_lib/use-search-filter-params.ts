'use client';

import {useRouter, useSearchParams} from 'next/navigation';
import {startTransition, useRef} from 'react';

export function useSearchFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const currentQuery = searchParams?.get('q') ?? '';
  const currentCategory = searchParams?.get('category') ?? '';

  const updateParams = (updates: Record<string, string>) => {
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const value = e.target.value;
    timerRef.current = setTimeout(() => {
      updateParams({q: value});
    }, 100);
  };

  const handleCategoryClick = (category: string) => {
    updateParams({category: currentCategory === category ? '' : category});
  };

  const clearCategory = () => updateParams({category: ''});

  return {currentQuery, currentCategory, handleSearch, handleCategoryClick, clearCategory};
}
