'use client';
import {useEmotionEnum} from '@/entities/emotion/lib/useEmotionEnum';
import {GuestbookEntriesResponse} from '@/entities/guestbook';
import {Badge} from '@/shared/ui/badge';
import {Item, ItemContent, ItemHeader, ItemSeparator, ItemTitle} from '@/shared/ui/item';
import {ScrollArea} from '@/shared/ui/scroll-area';
import {useFormatter} from 'next-intl';
import React from 'react';

export function GuestbookList({data}: {data?: GuestbookEntriesResponse}) {
  const entries = data?.entries ?? [];

  return (
    <ScrollArea className="h-[500px]">
      {entries.map((entry, index) => (
        <React.Fragment key={entry.id}>
          <GuestbookItem entry={entry} />
          {index < entries.length - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ScrollArea>
  );
}

function GuestbookItem({entry}: {entry: GuestbookEntriesResponse['entries'][number]}) {
  const format = useFormatter();
  const {getLabel, getEmoji} = useEmotionEnum();
  return (
    <Item className="px-0">
      <ItemHeader className="flex items-center justify-between">
        <ItemTitle>
          {entry.author_name}
          {
            <div className="flex flex-wrap gap-2">
              {entry.emotions?.map((emotion) => {
                const label = getLabel(emotion);
                return (
                  <Badge
                    key={`${entry.id}-${emotion}`}
                    variant="secondary"
                    className="bg-white/60 text-blue-700 shadow-sm backdrop-blur-sm dark:bg-white/10 dark:text-blue-100"
                  >
                    <span className="mr-1">{getEmoji(emotion)}</span>
                    {label}
                  </Badge>
                );
              })}
            </div>
          }
        </ItemTitle>
        <span className="text-xs text-muted-foreground">
          {format.dateTime(new Date(entry.created_at), {dateStyle: 'medium', timeStyle: 'short'})}
        </span>
      </ItemHeader>
      <ItemContent>
        <p className="ellipsis">{entry.message}</p>
      </ItemContent>
    </Item>
  );
}
