'use client';
import {cn} from '@/shared/lib/utils';
import {Button} from '@/shared/ui/button';
import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
  summary?: string;
  disabledPrev?: boolean;
  disabledNext?: boolean;
  className?: string;
  onNavigate?: (page: number) => void;
};

/**
 * URL-based pagination control with previous/next buttons and optional summary text.
 * Reads and updates the 'page' query parameter automatically.
 */
export function Pagination({
  currentPage,
  totalPages,
  prevLabel,
  nextLabel,
  summary,
  disabledPrev,
  disabledNext,
  className,
  onNavigate,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (pageNumber > 1) params.set('page', pageNumber.toString());
    else params.delete('page');

    const path = pathname ?? '';
    return params.toString() ? `${path}?${params.toString()}` : path;
  };

  const prevPageURL = currentPage > 1 ? createPageURL(currentPage - 1) : '#';
  const nextPageURL = currentPage < totalPages ? createPageURL(currentPage + 1) : '#';

  const handleClick = (page: number) => {
    onNavigate?.(page);
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-white/40 pt-4 text-sm text-muted-foreground dark:border-white/10',
        className,
      )}
      aria-label="pagination"
    >
      <div className="text-xs md:text-sm">{summary ?? `${currentPage} / ${Math.max(1, totalPages)}`}</div>
      <div className="flex gap-2">
        {disabledPrev || currentPage <= 1 ? (
          <Button size="sm" variant="glass" className="rounded-full" disabled>
            {prevLabel}
          </Button>
        ) : (
          <Button size="sm" variant="glass" className="rounded-full" asChild>
            <Link href={prevPageURL} scroll={false} onClick={() => handleClick(currentPage - 1)}>
              {prevLabel}
            </Link>
          </Button>
        )}
        {disabledNext || currentPage >= totalPages ? (
          <Button size="sm" variant="glass" className="rounded-full" disabled>
            {nextLabel}
          </Button>
        ) : (
          <Button size="sm" variant="glass" className="rounded-full" asChild>
            <Link href={nextPageURL} scroll={false} onClick={() => handleClick(currentPage + 1)}>
              {nextLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
