'use client';

import {
  EmotionOption,
  fetchGuestbookEntries,
  GUESTBOOK_PAGE_SIZE,
  GuestbookEntriesResponse,
} from '@/entities/guestbook';
import {FormText, GuestbookFormDialog} from '@/features/guestbook/submit';
import {Badge, Button} from '@/shared/ui';
import {Skeleton} from '@/shared/ui/skeleton';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {Dispatch, SetStateAction, Suspense, useMemo, useState} from 'react';
import {EntriesText} from '../model/types';

const GLASS_PANEL_CLASS =
  'relative overflow-hidden rounded-3xl border border-white/50 bg-white/60 px-6 py-5 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]';

const DEFAULT_PAGINATION = {
  page: 1,
  totalPages: 1,
  hasMore: false,
};

function buildSummary(copy: EntriesText['pagination'], page: number, totalPages: number) {
  return copy.summary.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

type Props = {
  locale: string;
  entriesText: EntriesText;
  formText: FormText;
  emotionOptions: EmotionOption[];
  initialData?: import('@/entities/guestbook').GuestbookEntriesResponse;
  initialPage?: number;
};

export function GuestbookWidget({locale, entriesText, formText, emotionOptions, initialData, initialPage = 1}: Props) {
  const [page, setPage] = useState(initialPage);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale],
  );

  const emotionMap = useMemo(() => {
    const map = new Map<string, EmotionOption>();
    emotionOptions.forEach((option) => map.set(option.code, option));
    return map;
  }, [emotionOptions]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/20" />
      <div className="pointer-events-none absolute right-2 top-0 h-56 w-56 rounded-full bg-purple-300/25 blur-3xl dark:bg-indigo-500/25" />
      <div className="pointer-events-none absolute left-1/3 top-20 h-32 w-32 rounded-full bg-white/60 blur-3xl dark:bg-white/10" />

      <div className="relative space-y-5">
        <div className={GLASS_PANEL_CLASS}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{entriesText.headerTitle}</h1>
              <p className="text-sm text-muted-foreground">{entriesText.headerSubtitle}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full rounded-full border border-white/60 bg-white/70 text-blue-700 backdrop-blur-md hover:bg-white md:w-auto dark:border-white/20 dark:bg-white/10 dark:text-white"
              onClick={() => setOpen(true)}
            >
              ✍️ {formText.triggerLabel}
            </Button>
          </div>

          <Suspense fallback={<GuestbookEntriesSkeleton entriesText={entriesText} />}>
            <GuestbookEntriesContent
              page={page}
              initialPage={initialPage}
              initialData={initialData}
              entriesText={entriesText}
              dateFormatter={dateFormatter}
              emotionMap={emotionMap}
              onPageChange={setPage}
            />
          </Suspense>
        </div>

        <GuestbookFormDialog
          open={open}
          onClose={() => setOpen(false)}
          formText={formText}
          emotionOptions={emotionOptions}
          onSubmitted={() => {
            setPage(1);
            queryClient.invalidateQueries({queryKey: ['guestbookEntries']});
          }}
        />
      </div>
    </div>
  );
}

type GuestbookEntriesContentProps = {
  page: number;
  initialPage: number;
  initialData?: GuestbookEntriesResponse;
  entriesText: EntriesText;
  dateFormatter: Intl.DateTimeFormat;
  emotionMap: Map<string, EmotionOption>;
  onPageChange: Dispatch<SetStateAction<number>>;
};

function GuestbookEntriesContent({
  page,
  initialPage,
  initialData,
  entriesText,
  dateFormatter,
  emotionMap,
  onPageChange,
}: GuestbookEntriesContentProps) {
  const {data, isError, isFetching, refetch} = useSuspenseQuery<GuestbookEntriesResponse, Error>({
    queryKey: ['guestbookEntries', page],
    queryFn: () => fetchGuestbookEntries(page, GUESTBOOK_PAGE_SIZE),
    initialData: page === initialPage ? initialData : undefined,
  });

  const entries = data.entries ?? [];
  const pagination = data.pagination ?? DEFAULT_PAGINATION;
  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const summaryText = buildSummary(entriesText.pagination, page, totalPages);

  const canGoPrev = page > 1;
  const canGoNext = pagination.hasMore ?? page < totalPages;

  const renderEntries = () => {
    if (isError) {
      return (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">{entriesText.fetchError}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            {entriesText.retry}
          </Button>
        </div>
      );
    }

    if (entries.length === 0) {
      return <div className="py-6 text-center text-muted-foreground">{entriesText.empty}</div>;
    }

    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="group rounded-2xl border border-white/40 bg-white/70 p-4 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.4)] backdrop-blur-md transition hover:border-white hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.6)] dark:hover:border-white/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{entry.author_name}</p>
              </div>
              <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(entry.created_at))}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{entry.message}</p>
            {entry.emotions && entry.emotions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.emotions.map((emotion) => {
                  const option = emotionMap.get(emotion);
                  if (!option) return null;
                  return (
                    <Badge
                      key={`${entry.id}-${emotion}`}
                      variant="secondary"
                      className="bg-white/60 text-blue-700 shadow-sm backdrop-blur-sm dark:bg-white/10 dark:text-blue-100"
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="relative mt-4" aria-busy={isFetching}>
        {isFetching ? (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-sm transition dark:bg-black/30">
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ) : null}
        {renderEntries()}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/40 pt-4 text-sm text-muted-foreground dark:border-white/10">
        <div className="text-xs md:text-sm">{summaryText}</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/60 bg-white/70 backdrop-blur-md hover:border-white hover:bg-white/80 dark:border-white/20 dark:bg-white/10"
            disabled={!canGoPrev || isFetching}
            onClick={() => onPageChange((prev) => Math.max(1, prev - 1))}
          >
            {entriesText.pagination.previous}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/60 bg-white/70 backdrop-blur-md hover:border-white hover:bg-white/80 dark:border-white/20 dark:bg-white/10"
            disabled={!canGoNext || isFetching}
            onClick={() => onPageChange((prev) => prev + 1)}
          >
            {entriesText.pagination.next}
          </Button>
        </div>
      </div>
    </>
  );
}

function GuestbookEntriesSkeleton({entriesText}: {entriesText: EntriesText}) {
  return (
    <>
      <div className="mt-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/40 pt-4 text-sm text-muted-foreground dark:border-white/10">
        <div className="text-xs md:text-sm">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/60 bg-white/70 backdrop-blur-md hover:border-white hover:bg-white/80 dark:border-white/20 dark:bg-white/10"
            disabled
          >
            {entriesText.pagination.previous}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/60 bg-white/70 backdrop-blur-md hover:border-white hover:bg-white/80 dark:border-white/20 dark:bg-white/10"
            disabled
          >
            {entriesText.pagination.next}
          </Button>
        </div>
      </div>
    </>
  );
}
