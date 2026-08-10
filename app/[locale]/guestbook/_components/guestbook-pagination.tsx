'use client';

import {ReactNode} from 'react';

import {usePathname, useSearchParams} from 'next/navigation';
import {ArrowUp} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGINATION_PARAMETER_PAGE} from '@/lib/api/pagination';
import {cn} from '@/utils/style';

function buildHref(searchParams: URLSearchParams | null, pathname: string, page: number) {
  const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
  if (page > DEFAULT_PAGE) params.set(PAGINATION_PARAMETER_PAGE, String(page));
  else params.delete(PAGINATION_PARAMETER_PAGE);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

function getVisiblePages(currentPage: number, totalPages: number, siblings = 1): PageItem[] {
  const totalSlots = siblings * 2 + 5;

  if (totalPages <= totalSlots) {
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblings, 1);
  const rightSibling = Math.min(currentPage + siblings, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({length: 3 + 2 * siblings}, (_, i) => i + 1);
    return [...leftRange, 'ellipsis-end', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightStart = totalPages - (3 + 2 * siblings) + 1;
    const rightRange = Array.from({length: 3 + 2 * siblings}, (_, i) => rightStart + i);
    return [1, 'ellipsis-start', ...rightRange];
  }

  const middleRange = Array.from({length: 1 + 2 * siblings}, (_, i) => leftSibling + i);
  return [1, 'ellipsis-start', ...middleRange, 'ellipsis-end', totalPages];
}

function PaginationNavLink({
  href,
  label,
  disabled,
  children,
}: {
  href: string;
  label: string;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <PaginationLink
      href={href}
      size="default"
      aria-label={label}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      prefetch={false}
      scroll={false}
      className={cn('h-8 gap-1 px-2.5 text-xs', disabled && 'pointer-events-none opacity-40')}
    >
      {children}
    </PaginationLink>
  );
}

type TopProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export function GuestbookPaginationTop({currentPage, totalPages, totalCount}: TopProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Guestbook.entries');
  const tCommon = useTranslations('Common.pagination');

  const prevDisabled = currentPage <= DEFAULT_PAGE;
  const nextDisabled = currentPage >= totalPages;
  const prevPage = Math.max(currentPage - 1, DEFAULT_PAGE);
  const nextPage = Math.min(currentPage + 1, totalPages);

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * DEFAULT_PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * DEFAULT_PAGE_SIZE, totalCount);

  const visibleItems = getVisiblePages(currentPage, totalPages);

  return (
    <div
      className="sticky top-12 z-30 -mx-4 flex items-center justify-between gap-3 border-b border-border/40 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="region"
      aria-label="Guestbook navigation"
    >
      <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
        {totalCount === 0
          ? t('totalCount', {count: 0})
          : t('rangeCount', {start: rangeStart, end: rangeEnd, total: totalCount})}
      </div>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationNavLink
              href={buildHref(searchParams, pathname, prevPage)}
              label={tCommon('previous')}
              disabled={prevDisabled}
            >
              <span className="hidden sm:block">{tCommon('previous')}</span>
            </PaginationNavLink>
          </PaginationItem>

          {visibleItems.map((item) => {
            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
              return (
                <PaginationItem key={item}>
                  <PaginationEllipsis className="size-8" />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={item}>
                <PaginationLink
                  href={buildHref(searchParams, pathname, item)}
                  isActive={item === currentPage}
                  size="icon"
                  prefetch={false}
                  scroll={false}
                  className={cn('size-8 text-xs tabular-nums', item === currentPage && 'pointer-events-none')}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNavLink
              href={buildHref(searchParams, pathname, nextPage)}
              label={tCommon('next')}
              disabled={nextDisabled}
            >
              <span className="hidden sm:block">{tCommon('next')}</span>
            </PaginationNavLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

type BottomProps = {
  currentPage: number;
  totalPages: number;
};

export function GuestbookPaginationBottom({currentPage, totalPages}: BottomProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Guestbook.entries');
  const tCommon = useTranslations('Common.pagination');

  const prevDisabled = currentPage <= DEFAULT_PAGE;
  const nextDisabled = currentPage >= totalPages;
  const prevPage = Math.max(currentPage - 1, DEFAULT_PAGE);
  const nextPage = Math.min(currentPage + 1, totalPages);

  const handleScrollTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4 text-xs text-muted-foreground">
      <button
        type="button"
        onClick={handleScrollTop}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
      >
        <ArrowUp className="size-3.5" aria-hidden />
        {t('backToTop')}
      </button>

      <Pagination className="mx-0 w-auto">
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationNavLink
              href={buildHref(searchParams, pathname, prevPage)}
              label={tCommon('previous')}
              disabled={prevDisabled}
            >
              {tCommon('previous')}
            </PaginationNavLink>
          </PaginationItem>
          <PaginationItem>
            <span className="px-1 font-medium tabular-nums text-foreground/70">
              {t('pageIndicator', {page: currentPage, totalPages})}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNavLink
              href={buildHref(searchParams, pathname, nextPage)}
              label={tCommon('next')}
              disabled={nextDisabled}
            >
              {tCommon('next')}
            </PaginationNavLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
