'use client';

import React, {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {GuestbookItemDto} from '../_lib/types';
import {Item, ItemContent, ItemDescription, ItemFooter, ItemSeparator, ItemTitle} from '@/components/ui/item';
import {LocalDateTime} from '@/components/ui/local-date-time';
import {ScrollArea} from '@/components/ui/scroll-area';
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGINATION_PARAMETER_PAGE} from '@/lib/api/pagination';
import {EmotionBadges} from './emotion-badges';
import {GuestbookDetailDialog} from './guestbook-detail-dialog';

export function GuestbookList({entries}: {entries: GuestbookItemDto[]}) {
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get(PAGINATION_PARAMETER_PAGE)) || DEFAULT_PAGE;
  const start = (page - 1) * DEFAULT_PAGE_SIZE;
  const items = entries.slice(start, start + DEFAULT_PAGE_SIZE);

  const [selectedItem, setSelectedItem] = useState<GuestbookItemDto | null>(null);

  return (
    <>
      <ScrollArea className="h-full">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <GuestbookItem item={item} onClick={() => setSelectedItem(item)} />
            {index < items.length - 1 && <ItemSeparator className="my-1" />}
          </React.Fragment>
        ))}
      </ScrollArea>
      <GuestbookDetailDialog
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </>
  );
}

type GuestbookItemProps = {
  item: GuestbookItemDto;
  onClick: () => void;
};

function GuestbookItem({item, onClick}: GuestbookItemProps) {
  return (
    <Item
      className="px-0 cursor-pointer hover:bg-accent/50 transition-colors rounded-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <ItemContent>
        <ItemTitle>
          {item.author_name}
          {item.emotions && <EmotionBadges emotions={item.emotions} />}
        </ItemTitle>
        <p className="text-ellipsis line-clamp-2">{item.message}</p>
      </ItemContent>
      <ItemFooter>
        <ItemDescription>
          <LocalDateTime date={item.created_at} timeStyle="short" />
        </ItemDescription>
      </ItemFooter>
    </Item>
  );
}
