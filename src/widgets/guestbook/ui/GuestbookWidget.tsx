'use client';

import {
  EmotionOption,
  fetchGuestbookList,
  GUESTBOOK_PAGE_SIZE,
  GuestbookEntriesResponse,
  QueryKeyFactory,
} from '@/entities/guestbook';
import {FormText, GuestbookFormDialog} from '@/features/guestbook/submit';
import {cn} from '@/shared/lib/utils';
import {Badge, Button, Pagination} from '@/shared/ui';
import {glass} from '@/shared/ui/glass';
import {GlassCard} from '@/shared/ui/glass-card';
import {useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {notFound, useSearchParams} from 'next/navigation';
import {ReactNode, Suspense, useMemo, useState} from 'react';
import {EntriesText} from '../model/types';
import {GuestbookEntriesSkeleton} from './GuestbookEntriesSkeleton';

type GuestbookEntry = GuestbookEntriesResponse['entries'][number];

function buildSummary(copy: EntriesText['pagination'], page: number, totalPages: number) {
  return copy.summary.replace('{page}', String(page)).replace('{totalPages}', String(totalPages));
}

type Props = {
  entriesText: EntriesText;
  formText: FormText;
  emotionOptions: EmotionOption[];
  initialData?: import('@/entities/guestbook').GuestbookEntriesResponse;
  initialPage?: number;
};

export function GuestbookWidget({entriesText, formText, emotionOptions, initialData, initialPage = 1}: Props) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const emotionMap = useMemo(() => {
    const map = new Map<string, EmotionOption>();
    emotionOptions.forEach((option) => map.set(option.code, option));
    return map;
  }, [emotionOptions]);

  const selectedEntryId = searchParams?.get('entry') ?? null;
  const showDetail = Boolean(selectedEntryId);

  const page = parsePositiveInt(searchParams?.get('page') ?? null) ?? initialPage;

  return (
    <div className="relative">
      <div className="relative space-y-5">
        <GlassCard paddingClassName="px-6 py-5" surfaceProps={{backgroundOpacity: 0.1, blur: 16, saturation: 1.3}}>
          {showDetail ? (
            <div className="flex justify-end">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => {}}>
                ← 목록으로 돌아가기
              </Button>
            </div>
          ) : (
            <GuestbookHeader entriesText={entriesText} formText={formText} onOpenForm={() => setOpen(true)} />
          )}

          <Suspense
            key={`${page}-${selectedEntryId ?? 'list'}`}
            fallback={<GuestbookEntriesSkeleton entriesText={entriesText} />}
          >
            <GuestbookList
              page={page}
              initialPage={initialPage}
              initialData={initialData}
              entriesText={entriesText}
              emotionMap={emotionMap}
              selectedEntryId={selectedEntryId}
            />
          </Suspense>
        </GlassCard>

        <GuestbookFormDialog
          open={open}
          onClose={() => setOpen(false)}
          formText={formText}
          emotionOptions={emotionOptions}
          onSubmitted={() => {
            queryClient.invalidateQueries({queryKey: ['guestbookEntries']});
          }}
        />
      </div>
    </div>
  );
}

type GuestbookListProps = {
  page: number;
  initialPage: number;
  initialData?: GuestbookEntriesResponse;
  entriesText: EntriesText;
  emotionMap: Map<string, EmotionOption>;
  selectedEntryId: string | null;
};

function GuestbookList({page, initialPage, initialData, entriesText, emotionMap, selectedEntryId}: GuestbookListProps) {
  const {data, isError, isFetching, refetch} = useSuspenseQuery<GuestbookEntriesResponse, Error>({
    queryKey: QueryKeyFactory.list(page),
    queryFn: () => fetchGuestbookList(page, GUESTBOOK_PAGE_SIZE),
    initialData: page === initialPage ? initialData : undefined,
  });

  const entries = data.entries ?? [];
  const pagination = data.pagination;
  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const summaryText = buildSummary(entriesText.pagination, page, totalPages);

  const canGoPrev = page > 1;
  const canGoNext = pagination.hasMore ?? page < totalPages;

  const selectedEntry = selectedEntryId ? (entries.find((entry) => entry.id === selectedEntryId) ?? null) : null;
  if (selectedEntryId && !selectedEntry) {
    notFound();
  }

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

    return <EntryList entries={entries} emotionMap={emotionMap} />;
  };

  const showDetail = Boolean(selectedEntry);

  return (
    <>
      <div className="relative mt-4 min-h-[240px]" aria-busy={isFetching}>
        <FadeSection show={!showDetail}>{renderEntries()}</FadeSection>
        <FadeSection show={showDetail}>
          {selectedEntry ? (
            <GuestbookDetail entry={selectedEntry} emotionMap={emotionMap} entriesText={entriesText} />
          ) : null}
        </FadeSection>
      </div>

      {!showDetail ? (
        <Pagination
          className="mt-5"
          summary={summaryText}
          currentPage={page}
          totalPages={totalPages}
          prevLabel={entriesText.pagination.previous}
          nextLabel={entriesText.pagination.next}
          disabledPrev={!canGoPrev || isFetching}
          disabledNext={!canGoNext || isFetching}
        />
      ) : null}
    </>
  );
}

type EntryListProps = {
  entries: GuestbookEntry[];
  emotionMap: Map<string, EmotionOption>;
};

function EntryList({entries, emotionMap}: EntryListProps) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} emotionMap={emotionMap} />
      ))}
    </div>
  );
}

type EntryItemProps = {
  entry: GuestbookEntry;
  emotionMap: Map<string, EmotionOption>;
};

function EntryItem({entry, emotionMap}: EntryItemProps) {
  return (
    <button
      type="button"
      onClick={() => {}}
      className={cn(
        glass.card,
        'group w-full p-4 text-left transition hover:border-black/30 hover:shadow-[0_14px_36px_-20px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:border-white/40 dark:hover:shadow-[0_14px_36px_-20px_rgba(59,130,246,0.4)]',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground">{entry.author_name}</p>
          {entry.emotions && entry.emotions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
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
        <span className="text-xs text-muted-foreground">{entry.created_at}</span>
      </div>
      <p className="mt-2 w-full truncate text-sm leading-relaxed text-foreground">{entry.message}</p>
    </button>
  );
}

type EntryDetailProps = {
  entry: GuestbookEntry;
  emotionMap: Map<string, EmotionOption>;
  entriesText: EntriesText;
};

function GuestbookDetail({entry, emotionMap, entriesText}: EntryDetailProps) {
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
            const option = emotionMap.get(emotion);
            if (!option) return null;
            return (
              <Badge
                key={`${entry.id}-detail-${emotion}`}
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
  );
}

type FadeSectionProps = {
  show: boolean;
  children: ReactNode;
};

function FadeSection({show, children}: FadeSectionProps) {
  return (
    <div
      className={cn(
        'transition-opacity duration-300',
        show ? 'opacity-100' : 'pointer-events-none absolute inset-0 opacity-0',
      )}
      aria-hidden={!show}
    >
      {children}
    </div>
  );
}

type GuestbookHeaderProps = {
  entriesText: EntriesText;
  formText: FormText;
  onOpenForm: () => void;
};

function GuestbookHeader({entriesText, formText, onOpenForm}: GuestbookHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{entriesText.headerTitle}</h1>
        <p className="text-sm text-muted-foreground">{entriesText.headerSubtitle}</p>
      </div>
      <Button size="sm" variant="glass" className="w-full rounded-full md:w-auto" onClick={onOpenForm}>
        ✍️ {formText.triggerLabel}
      </Button>
    </div>
  );
}

function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}
