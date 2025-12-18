'use client';

import {EMOTION_LABEL_KEYS, EMOTION_MAP, EmotionCode, GuestbookEntriesResponse} from '@/entities/guestbook';
import {cn} from '@/shared/lib/style';
import {Badge, Button} from '@/shared/ui';
import {glass} from '@/shared/ui/glass';
import {useTranslations} from 'next-intl';
import {EntriesText} from '../model/types';

type GuestbookEntry = GuestbookEntriesResponse['entries'][number];

type Props = {
  entry: GuestbookEntry;
  entriesText: EntriesText;
};

export function GuestbookDetail({entry, entriesText}: Props) {
  const t = useTranslations('Guestbook');

  return (
    <div className={cn(glass.card, 'space-y-4 p-5')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{entry.created_at}</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{entry.author_name}</h3>
        </div>
        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => {}}>
          {entriesText.pagination.previous}
        </Button>
      </div>
      <p className="text-base leading-relaxed text-foreground whitespace-pre-line">{entry.message}</p>
      {entry.emotions && entry.emotions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {entry.emotions.map((emotion) => {
            const option = EMOTION_MAP[emotion as EmotionCode];
            const labelKey = EMOTION_LABEL_KEYS[emotion as EmotionCode];
            if (!option || !labelKey) return null;
            const label = t(labelKey);
            return (
              <Badge
                key={`${entry.id}-detail-${emotion}`}
                variant="secondary"
                className="bg-white/60 text-blue-700 shadow-sm backdrop-blur-sm dark:bg-white/10 dark:text-blue-100"
              >
                <span className="mr-1">{option.emoji}</span>
                {label}
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
