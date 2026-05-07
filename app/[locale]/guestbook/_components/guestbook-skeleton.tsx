import React from 'react';

import {Skeleton} from '@/components/ui/skeleton';

export function GuestbookListSkeleton() {
  return (
    <ul className="flex flex-col">
      {Array.from({length: 6}).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key -- 정적 길이의 스켈레톤은 데이터 키가 없음
        <li key={`guestbook-item-skeleton-${index}`} className="border-b border-border/40 last:border-b-0">
          <GuestbookItemSkeleton />
        </li>
      ))}
    </ul>
  );
}

function GuestbookItemSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 px-1 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
