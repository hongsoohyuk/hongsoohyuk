import {Item, ItemContent, ItemHeader, ItemSeparator, ItemTitle} from '@/shared/ui/item';
import {ScrollArea} from '@/shared/ui/scroll-area';
import {Skeleton} from '@/shared/ui/skeleton';
import React from 'react';

export function GuestbookListSkeleton() {
  return (
    <ScrollArea className="h-[500px]">
      {Array.from({length: 8}).map((_, index) => (
        <React.Fragment key={`guestbook-item-skeleton-${index}`}>
          <GuestbookItemSkeleton />
          {index < 8 - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ScrollArea>
  );
}

export function GuestbookItemSkeleton() {
  return (
    <Item className="px-0">
      <ItemHeader className="flex items-center justify-between">
        <ItemTitle>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </ItemTitle>
      </ItemHeader>
      <ItemContent>
        <Skeleton className="h-4 w-32" />
      </ItemContent>
    </Item>
  );
}
