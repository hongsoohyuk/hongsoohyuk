'use client';

import {useFormatter} from 'next-intl';

import {GuestbookItemDto} from '@/features/guestbook/types';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {EmotionBadges} from './EmotionBadges';


type Props = {
  item: GuestbookItemDto | null;
  open: boolean;
  onOpenChange: React.ComponentProps<typeof Dialog>['onOpenChange'];
};

export function GuestbookDetailDialog({item, open, onOpenChange}: Props) {
  const format = useFormatter();

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-64 flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {item.author_name}
            {item.emotions && <EmotionBadges emotions={item.emotions} />}
          </DialogTitle>
          <DialogDescription>
            {format.dateTime(new Date(item.created_at), {dateStyle: 'full', timeStyle: 'short'})}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex-1 min-h-0 overflow-y-auto">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{item.message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
