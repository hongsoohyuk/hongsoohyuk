'use client';

import React, {useState} from 'react';
import {useEmotionEnum} from '@/entities/emotion/lib/useEmotionEnum';
import {GuestbookItemDto, GuestbookListResponse} from '@/entities/guestbook/types';
import {Badge} from '@/shared/ui/badge';
import {Item, ItemContent, ItemDescription, ItemFooter, ItemSeparator, ItemTitle} from '@/shared/ui/item';
import {LocalDateTime} from '@/shared/ui/local-date-time';
import {ScrollArea} from '@/shared/ui/scroll-area';
import {GuestbookDetailDialog} from './GuestbookDetailDialog';

export function GuestbookList({data}: {data?: GuestbookListResponse}) {
  const items = data?.entries ?? [];
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
  const {getLabel, getEmoji} = useEmotionEnum();
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
          {item.emotions?.map((emotion) => (
            <Badge key={`${item.id}-${emotion}`} variant="secondary" className="gap-1 shrink-0">
              {getEmoji(emotion)} {getLabel(emotion)}
            </Badge>
          ))}
        </ItemTitle>
        <p className="text-ellipsis line-clamp-2">{item.message}</p>
      </ItemContent>
      <ItemFooter>
        <ItemDescription>
          <LocalDateTime date={item.created_at} />
        </ItemDescription>
      </ItemFooter>
    </Item>
  );
}
