'use client';

import {useState} from 'react';

import {LocalDateTime} from '@/components/ui/local-date-time';
import {RelativeTime} from '@/components/ui/relative-time';

import {EmotionBadges} from './emotion-badges';
import {GuestbookDetailDialog} from './guestbook-detail-dialog';
import {GuestbookItemDto} from '../_lib/types';

export function GuestbookList({items}: {items: GuestbookItemDto[]}) {
  const [selectedItem, setSelectedItem] = useState<GuestbookItemDto | null>(null);

  return (
    <>
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="border-b border-border/40 last:border-b-0">
            <button
              type="button"
              onClick={() => setSelectedItem(item)}
              className="flex w-full flex-col gap-1.5 rounded-md px-1 py-3.5 text-left transition-colors hover:bg-accent/30 focus-visible:bg-accent/30 focus-visible:outline-none"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{item.author_name}</span>
                  {item.emotions && <EmotionBadges emotions={item.emotions} />}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                  <span className="hidden md:inline">
                    <LocalDateTime date={item.created_at} dateStyle="medium" timeStyle="short" />
                  </span>
                  <span className="md:hidden">
                    <LocalDateTime date={item.created_at} timeStyle="short" />
                  </span>
                  <span aria-hidden>·</span>
                  <RelativeTime date={item.created_at} />
                </span>
              </div>
              <p className="line-clamp-2 break-words text-sm text-muted-foreground">{item.message}</p>
            </button>
          </li>
        ))}
      </ul>
      <GuestbookDetailDialog
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </>
  );
}
