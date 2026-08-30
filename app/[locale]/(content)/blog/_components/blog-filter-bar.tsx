'use client';

import {useRef} from 'react';

import {SlidersHorizontal, X} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {Badge} from '@/components/ui/badge';
import {SearchInput} from '@/components/ui/search-input';

import {BLOG_CATEGORIES} from '@/lib/content/blog-categories';
import type {BlogVisibility} from '@/lib/content/blog';
import {useStickyDetection} from '../_lib/use-sticky-detection';

const HEADER_HEIGHT = 48;

const CATEGORY_BUTTON_CLASS = 'shrink-0 focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none';

// useSearchParams를 읽지 않는 순수 표현 컴포넌트. 정적 프리렌더가 가능해야 하므로
// 현재 쿼리/카테고리는 props로 받는다 (URL을 읽는 쪽은 BlogSearchFilter).
type Props = {
  query: string;
  category: string;
  visibility?: BlogVisibility;
  disabled?: boolean;
  onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryClick?: (category: string) => void;
  onVisibilityClick?: () => void;
  onClear?: () => void;
};

export function BlogFilterBar({
  query,
  category,
  visibility = 'public',
  disabled,
  onSearch,
  onCategoryClick,
  onVisibilityClick,
  onClear,
}: Props) {
  const t = useTranslations('Blog');
  const filterRef = useRef<HTMLDivElement>(null);
  const {isSticky, isCollapsed, setIsCollapsed} = useStickyDetection(filterRef, HEADER_HEIGHT, disabled);

  const isMemoFilter = visibility === 'private';
  const hasActiveFilter = query || category || isMemoFilter;
  const activeFilterLabel = isMemoFilter ? t('memoForMyself') : category || query;

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
              {activeFilterLabel}
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
            disabled={disabled}
            placeholder={t('search')}
            defaultValue={query}
            onChange={onSearch}
            aria-label={t('search')}
          />

          <div className="relative">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide" role="group" aria-label="Category filter">
              <button type="button" onClick={onClear} disabled={disabled} className={CATEGORY_BUTTON_CLASS}>
                <Badge variant={!isMemoFilter && category === '' ? 'default' : 'outline'} className="cursor-pointer text-xs">
                  {t('allCategories')}
                </Badge>
              </button>
              {BLOG_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onCategoryClick?.(item)}
                  disabled={disabled}
                  className={CATEGORY_BUTTON_CLASS}
                >
                  <Badge variant={category === item ? 'default' : 'outline'} className="cursor-pointer text-xs">
                    {item}
                  </Badge>
                </button>
              ))}
              <button
                type="button"
                onClick={onVisibilityClick}
                disabled={disabled}
                className={CATEGORY_BUTTON_CLASS}
              >
                <Badge variant={isMemoFilter ? 'default' : 'outline'} className="cursor-pointer text-xs">
                  {t('memoForMyself')}
                </Badge>
              </button>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}
