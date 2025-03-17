'use client';

import {useRef} from 'react';

import {SlidersHorizontal, X} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {Badge} from '@/components/ui/badge';
import {SearchInput} from '@/components/ui/search-input';

import {BLOG_CATEGORIES} from '../types';
import {useSearchFilterParams} from '../hooks/use-search-filter-params';
import {useStickyDetection} from '../hooks/use-sticky-detection';

const HEADER_HEIGHT = 48;

const CATEGORY_BUTTON_CLASS = 'shrink-0 focus-visible:ring-ring/50 focus-visible:ring-[3px] rounded-md outline-none';

export function BlogSearchFilter(props: {disabled?: boolean}) {
  const t = useTranslations('Blog');
  const filterRef = useRef<HTMLDivElement>(null);

  const {currentQuery, currentCategory, handleSearch, handleCategoryClick, clearCategory} =
    useSearchFilterParams();
  const {isSticky, isCollapsed, setIsCollapsed} = useStickyDetection(filterRef, HEADER_HEIGHT, props.disabled);

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
                onClick={clearCategory}
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
