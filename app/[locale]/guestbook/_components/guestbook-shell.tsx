'use client';

import {useTranslations} from 'next-intl';

import {Empty, EmptyDescription} from '@/components/ui/empty';
import {DEFAULT_PAGE_SIZE} from '@/lib/api/pagination';

import {EmotionFilter} from './emotion-filter';
import {GuestbookList} from './guestbook-list';
import {GuestbookPaginationBottom, GuestbookPaginationTop} from './guestbook-pagination';
import {useGuestbookFilter} from '../_lib/use-guestbook-filter';
import type {GuestbookItemDto} from '../_lib/types';

export function GuestbookShell({entries}: {entries: GuestbookItemDto[]}) {
  const t = useTranslations('Guestbook.entries');
  const {selectedEmotion, currentPage} = useGuestbookFilter();

  const filtered = selectedEmotion ? entries.filter((entry) => entry.emotions?.includes(selectedEmotion)) : entries;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * DEFAULT_PAGE_SIZE;
  const visible = filtered.slice(start, start + DEFAULT_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <EmotionFilter />
      <GuestbookPaginationTop currentPage={safePage} totalPages={totalPages} totalCount={totalCount} />
      {visible.length === 0 ? (
        <Empty variant="inline" className="py-12 text-center">
          <EmptyDescription>{selectedEmotion ? t('filterEmptyResult') : t('empty')}</EmptyDescription>
        </Empty>
      ) : (
        <GuestbookList items={visible} />
      )}
      <GuestbookPaginationBottom currentPage={safePage} totalPages={totalPages} />
    </div>
  );
}
