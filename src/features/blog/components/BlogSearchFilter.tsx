'use client';

import {SlidersHorizontal, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useRouter, useSearchParams} from 'next/navigation';
import {startTransition, useEffect, useRef, useState} from 'react';

import {Badge} from '@/components/ui/badge';
import {SearchInput} from '@/components/ui/search-input';

import {BLOG_CATEGORIES} from '../types';

const HEADER_HEIGHT = 48; // h-12 = 3rem

const CATEGORY_BUTTON_CLASS = 'shrink-0 focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none';

export function BlogSearchFilter(props: {disabled?: boolean}) {
  const t = useTranslations('Blog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentQuery = searchParams?.get('q') ?? '';
  const currentCategory = searchParams?.get('category') ?? '';

  useEffect(() => {
    if (props.disabled) return;

    const filter = filterRef.current;
    if (!filter) return;

    const initialTop = filter.offsetTop;

    const handleScroll = () => {
      const stuck = window.scrollY + HEADER_HEIGHT >= initialTop;
      setIsSticky(stuck);
      if (!stuck) setIsCollapsed(false);
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [props.disabled]);

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

  const hasActiveFilter = currentQuery || currentCategory;

  return (
    <div
      ref={filterRef}
      className={
        isSticky
          ? 'sticky top-12 z-40 -mx-4 px-4 py-3 md:-mx-6 md:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40'
          : undefined
      }
    >
      {isSticky && isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="size-4" />
          <span>{t('search')}</span>
          {hasActiveFilter && (
            <Badge variant="secondary" className="text-xs">
              {currentCategory || currentQuery}
            </Badge>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          {isSticky && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close filter"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

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
                disabled={props.disabled}
                className={CATEGORY_BUTTON_CLASS}
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
                  disabled={props.disabled}
                  className={CATEGORY_BUTTON_CLASS}
                >
                  <Badge
                    variant={currentCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                  >
                    {category}
                  </Badge>
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}
