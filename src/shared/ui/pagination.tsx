'use client';

import {cn} from '@/shared/lib/style';
import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {Button} from './button';

type PaginationProps = {
  totalPages: number;
};

export function Pagination({totalPages}: PaginationProps) {
  // const t = useTranslations('Pagination');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams?.get('page')) || 1;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (pageNumber > 1) params.set('page', pageNumber.toString());
    else params.delete('page');

    const path = pathname ?? '';
    return params.toString() ? `${path}?${params.toString()}` : path;
  };

  //   const handleSearch = useDebouncedCallback((term) => {
  //   const params = new URLSearchParams(searchParams);
  //   params.set('page', '1');
  //   if (term) {
  //     params.set('query', term);
  //   } else {
  //     params.delete('query');
  //   }
  //   replace(`${pathname}?${params.toString()}`);
  // }, 300);

  const prevHref = createPageURL(Math.max(1, currentPage - 1));
  const nextHref = createPageURL(Math.min(totalPages, currentPage + 1));

  return (
    <div
      className={cn('flex items-center justify-between text-sm text-muted-foreground gap-3')}
      aria-label="pagination"
    >
      <div className="text-xs md:text-sm">{`${currentPage} / ${Math.max(1, totalPages)}`}</div>
      <div className="flex gap-2">
        <Button size="sm" variant={'secondary'} className="rounded-full" disabled={currentPage <= 1} asChild>
          <Link aria-disabled={currentPage <= 1} href={prevHref}>
            prev
          </Link>
        </Button>

        <Button size="sm" variant={'secondary'} className="rounded-full" disabled={currentPage >= totalPages} asChild>
          <Link aria-disabled={currentPage >= totalPages} href={nextHref}>
            next
          </Link>
        </Button>
      </div>
    </div>
  );
}
