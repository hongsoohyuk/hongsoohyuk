import {useEmotionEnum} from '@/entities/emotion/lib/useEmotionEnum';
import {GuestbookItemDto, GuestbookListResponse} from '@/entities/guestbook/types';
import {Badge} from '@/shared/ui/badge';
import {Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemSeparator, ItemTitle} from '@/shared/ui/item';
import {ScrollArea} from '@/shared/ui/scroll-area';
import {useFormatter} from 'next-intl';
import React from 'react';

export function GuestbookList({data}: {data?: GuestbookListResponse}) {
  const items = data?.entries ?? [];

  return (
    <ScrollArea className="h-full">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <GuestbookItem item={item} />
          {index < items.length - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ScrollArea>
  );
}

function GuestbookItem({item}: {item: GuestbookItemDto}) {
  const format = useFormatter();
  const {getLabel, getEmoji} = useEmotionEnum();
  return (
    <Item className="px-0">
      <ItemContent>
        <ItemTitle>
          {item.author_name}
          {item.emotions?.map((emotion) => (
            <Badge key={`${item.id}-${emotion}`} variant="secondary" className="gap-1 shrink-0">
              {getEmoji(emotion)} {getLabel(emotion)}
            </Badge>
          ))}
        </ItemTitle>
        <p className="text-ellipsis overflow-hidden whitespace-nowrap">{item.message}</p>
      </ItemContent>
      <ItemFooter>
        <ItemDescription>
          {format.dateTime(new Date(item.created_at), {dateStyle: 'medium', timeStyle: 'short'})}
        </ItemDescription>
      </ItemFooter>
    </Item>
  );
}
