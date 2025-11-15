'use client';

import {Badge, Button, Card, CardContent, CardHeader, CardTitle} from '@/component/ui';
import {Skeleton} from '@/component/ui/skeleton';
import {useQuery} from '@tanstack/react-query';
import {useMemo, useState} from 'react';
import {GuestbookFormDialog} from './guestbook-form-dialog';
import {EmotionOption, EntriesCopy, FormCopy} from './guestbook-types';

type ApiGuestbookEntry = {
  id: string;
  author_name: string;
  message: string;
  emotions: string[] | null;
  created_at: string;
};

type GuestbookResponse = {
  entries: ApiGuestbookEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

type GuestbookPreviewProps = {
  locale: string;
  entriesCopy: EntriesCopy;
  formCopy: FormCopy;
  emotionOptions: EmotionOption[];
};

const PAGE_SIZE = 5;

async function fetchGuestbookEntries(page: number): Promise<GuestbookResponse> {
  const params = new URLSearchParams({page: String(page), pageSize: String(PAGE_SIZE)});
  const res = await fetch(`/api/guestbook?${params.toString()}`, {
    headers: {'Content-Type': 'application/json'},
    cache: 'no-store',
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.error ?? 'Failed to load guestbook.';
    throw new Error(message);
  }

  return res.json();
}

export function GuestbookPreview({locale, entriesCopy, formCopy, emotionOptions}: GuestbookPreviewProps) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

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

  const {data, isLoading, isFetching, isError, refetch} = useQuery({
    queryKey: ['guestbookEntries', page],
    queryFn: () => fetchGuestbookEntries(page),
    keepPreviousData: true,
  });

  const entries = data?.entries ?? [];
  const pagination = data?.pagination ?? {page, totalPages: 1, hasMore: false};
  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const summaryText = entriesCopy.pagination.summary
    .replace('{page}', String(page))
    .replace('{totalPages}', String(totalPages));

  const canGoPrev = page > 1;
  const canGoNext = pagination.hasMore ?? page < totalPages;

  const renderEntries = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 px-6 py-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">{entriesCopy.fetchError}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            {entriesCopy.retry}
          </Button>
        </div>
      );
    }

    if (entries.length === 0) {
      return <div className="px-6 py-8 text-center text-muted-foreground">{entriesCopy.empty}</div>;
    }

    return (
      <div className="divide-y divide-border/70">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-3 px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="font-semibold">{entry.author_name}</p>
              <span className="text-muted-foreground">{dateFormatter.format(new Date(entry.created_at))}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{entry.message}</p>
            {entry.emotions && entry.emotions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {entry.emotions.map((emotion) => {
                  const option = emotionMap.get(emotion);
                  if (!option) return null;
                  return (
                    <Badge
                      key={`${entry.id}-${emotion}`}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100"
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
      <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50/60 via-white to-purple-50/60 px-6 py-6 shadow-sm dark:border-blue-500/20 dark:from-slate-900/60 dark:via-slate-950 dark:to-indigo-950/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{entriesCopy.headerTitle}</h1>
            <p className="text-sm text-muted-foreground">{entriesCopy.headerSubtitle}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-full border-blue-200/60 bg-white/80 text-blue-700 shadow-sm hover:bg-blue-50 md:w-auto"
            onClick={() => setOpen(true)}
          >
            ✍️ {formCopy.triggerLabel}
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold">{entriesCopy.listTitle}</CardTitle>
            {isFetching && !isLoading ? <span className="text-xs text-muted-foreground">Syncing…</span> : null}
          </div>
        </CardHeader>
        <CardContent className="px-0">{renderEntries()}</CardContent>
        <div className="flex flex-col gap-3 border-t border-border/70 px-6 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>{summaryText}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={!canGoPrev || isLoading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              {entriesCopy.pagination.previous}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!canGoNext || isLoading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              {entriesCopy.pagination.next}
            </Button>
          </div>
        </div>
      </Card>

      <GuestbookFormDialog
        open={open}
        onClose={() => setOpen(false)}
        formCopy={formCopy}
        emotionOptions={emotionOptions}
        onSubmitted={() => {
          setPage(1);
          refetch();
        }}
      />
    </>
  );
}
