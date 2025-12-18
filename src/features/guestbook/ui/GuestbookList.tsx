import {
  EMOTION_LABEL_KEYS,
  EMOTION_MAP,
  EmotionCode,
  fetchGuestbookList,
  GuestbookEntriesResponse,
  QueryKeyFactory,
} from '@/entities/guestbook';
import {parsePositiveInt} from '@/shared/lib/number';
import {Badge} from '@/shared/ui';
import {Item, ItemContent, ItemGroup, ItemHeader, ItemSeparator, ItemTitle} from '@/shared/ui/item';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useFormatter, useTranslations} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import React from 'react';

export function GuestbookList({initialData}: {initialData?: GuestbookEntriesResponse}) {
  const searchParams = useSearchParams();
  const page = parsePositiveInt(searchParams?.get('page') ?? null) ?? 1;
  const {data} = useSuspenseQuery<GuestbookEntriesResponse, Error>({
    queryKey: QueryKeyFactory.list(page),
    queryFn: () => fetchGuestbookList(page),
    initialData: initialData,
  });

  const entries = data.entries ?? [];

  return (
    <ItemGroup>
      {entries.map((entry, index) => (
        <React.Fragment key={entry.id}>
          <GuestbookItem entry={entry} />
          {index < entries.length - 1 && <ItemSeparator />}
        </React.Fragment>
      ))}
    </ItemGroup>
  );
}

function GuestbookItem({entry}: {entry: GuestbookEntriesResponse['entries'][number]}) {
  const t = useTranslations('Guestbook');
  const format = useFormatter();

  return (
    <Item className="px-0">
      <ItemHeader className="flex items-center justify-between">
        <ItemTitle>
          {entry.author_name}
          {entry.emotions && entry.emotions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {entry.emotions.map((emotion) => {
                const option = EMOTION_MAP[emotion as EmotionCode];
                const labelKey = EMOTION_LABEL_KEYS[emotion as EmotionCode];
                if (!option || !labelKey) return null;
                const label = t(labelKey);
                return (
                  <Badge
                    key={`${entry.id}-${emotion}`}
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
