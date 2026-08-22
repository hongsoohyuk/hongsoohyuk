'use client';

import {useTranslations} from 'next-intl';

import {Empty, EmptyDescription} from '@/components/ui/empty';
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE} from '@/lib/api/pagination';

import {EmotionFilter} from './emotion-filter';
import {GuestbookList} from './guestbook-list';
import {GuestbookPaginationBottom, GuestbookPaginationTop} from './guestbook-pagination';
import {useGuestbookFilter} from '../_lib/use-guestbook-filter';
import type {EmotionCode} from '../_lib/emotion';
import type {GuestbookItemDto} from '../_lib/types';

type ViewProps = {
  entries: GuestbookItemDto[];
  selectedEmotion: EmotionCode | null;
  currentPage: number;
  search: string;
  onToggleEmotion?: (code: EmotionCode) => void;
  onClearEmotion?: () => void;
  onPageChange?: (page: number) => void;
};

// URL을 읽지 않는 순수 표현 컴포넌트. 프리렌더 fallback으로도 그대로 쓰인다.
function GuestbookView({
  entries,
  selectedEmotion,
  currentPage,
  search,
  onToggleEmotion,
  onClearEmotion,
  onPageChange,
}: ViewProps) {
  const t = useTranslations('Guestbook.entries');

  const filtered = selectedEmotion ? entries.filter((entry) => entry.emotions?.includes(selectedEmotion)) : entries;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * DEFAULT_PAGE_SIZE;
  const visible = filtered.slice(start, start + DEFAULT_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <EmotionFilter selectedEmotion={selectedEmotion} onToggle={onToggleEmotion} onClear={onClearEmotion} />
      <GuestbookPaginationTop
        currentPage={safePage}
        totalPages={totalPages}
        totalCount={totalCount}
        search={search}
        onPageChange={onPageChange}
      />
      {visible.length === 0 ? (
        <Empty variant="inline" className="py-12 text-center">
          <EmptyDescription>{selectedEmotion ? t('filterEmptyResult') : t('empty')}</EmptyDescription>
        </Empty>
      ) : (
        <GuestbookList items={visible} />
      )}
      <GuestbookPaginationBottom
        currentPage={safePage}
        totalPages={totalPages}
        search={search}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export function GuestbookShell({entries}: {entries: GuestbookItemDto[]}) {
  const {selectedEmotion, currentPage, search, toggleEmotion, clearEmotion, goToPage} = useGuestbookFilter();

  return (
    <GuestbookView
      entries={entries}
      selectedEmotion={selectedEmotion}
      currentPage={currentPage}
      search={search}
      onToggleEmotion={toggleEmotion}
      onClearEmotion={clearEmotion}
      onPageChange={goToPage}
    />
  );
}

// 정적 렌더 시 GuestbookShell은 useSearchParams 때문에 클라이언트로 넘어간다.
// 쿼리 없는 기본 상태(필터 없음·1페이지)를 프리렌더 HTML에 그대로 채워
// 목록이 비어 나가거나 레이아웃이 튀지 않게 한다.
export function GuestbookShellFallback({entries}: {entries: GuestbookItemDto[]}) {
  return <GuestbookView entries={entries} selectedEmotion={null} currentPage={DEFAULT_PAGE} search="" />;
}
