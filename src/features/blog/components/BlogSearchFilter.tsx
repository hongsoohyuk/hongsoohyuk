'use client';

import {useTranslations} from 'next-intl';
import {useRouter, useSearchParams} from 'next/navigation';
import {startTransition, useRef} from 'react';

import {Badge} from '@/components/ui/badge';
import {SearchInput} from '@/components/ui/search-input';

import {BLOG_CATEGORIES} from '../types';

export function BlogSearchFilter(props: {disabled?: boolean}) {
  const t = useTranslations('Blog');
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
    if (props.disabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const value = e.target.value;
    timerRef.current = setTimeout(() => {
      updateParams({q: value});
    }, 100);
  };

  const handleCategoryClick = (category: string) => {
    if (props.disabled) return;
    updateParams({category: currentCategory === category ? '' : category});
  };

  return (
    <div className="space-y-3">
      <SearchInput
        disabled={props.disabled}
        placeholder={t('search')}
        defaultValue={currentQuery}
        onChange={handleSearch}
        aria-label={t('search')}
      />

      <div className="relative">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label="Category filter">
          <button
            type="button"
            onClick={() => updateParams({category: ''})}
            className="shrink-0 focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none"
          >
            <Badge variant={currentCategory === '' ? 'default' : 'outline'} className="cursor-pointer text-xs">
              {t('allCategories')}
            </Badge>
          </button>
          {BLOG_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className="shrink-0 focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none"
            >
              <Badge variant={currentCategory === category ? 'default' : 'outline'} className="cursor-pointer text-xs">
                {category}
              </Badge>
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
