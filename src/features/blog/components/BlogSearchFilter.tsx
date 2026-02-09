'use client';

import {useRef, startTransition} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {SearchIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {cn} from '@/utils/style';

import {BLOG_CATEGORIES} from '../types';

export function BlogSearchFilter() {
  const t = useTranslations('Blog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const currentQuery = searchParams.get('q') ?? '';
  const currentCategory = searchParams.get('category') ?? '';

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

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
    }, 300);
  };

  const handleCategoryClick = (category: string) => {
    updateParams({category: currentCategory === category ? '' : category});
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder={t('search')}
          defaultValue={currentQuery}
          onChange={handleSearch}
          className="pl-9"
          aria-label={t('search')}
        />
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category filter">
        <button
          type="button"
          onClick={() => updateParams({category: ''})}
          className="focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none"
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
            className={cn('focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none')}
          >
            <Badge variant={currentCategory === category ? 'default' : 'outline'} className="cursor-pointer text-xs">
              {category}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
