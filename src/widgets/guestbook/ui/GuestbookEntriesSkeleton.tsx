import {cn} from '@/shared/lib/utils';
import {Button} from '@/shared/ui';
import {glass} from '@/shared/ui/glass';
import {Skeleton} from '@/shared/ui/skeleton';
import {EntriesText} from '../model/types';

export function GuestbookEntriesSkeleton({entriesText}: {entriesText: EntriesText}) {
  return (
    <>
      <div className="mt-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className={cn(glass.card, 'p-4')}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>

              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[...Array(3)].map((item) => (
                  <Skeleton key={item} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/40 pt-4 text-sm text-muted-foreground dark:border-white/10">
        <div className="text-xs md:text-sm">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="glass" className="rounded-full" disabled>
            {entriesText.pagination.previous}
          </Button>
          <Button size="sm" variant="glass" className="rounded-full" disabled>
            {entriesText.pagination.next}
          </Button>
        </div>
      </div>
    </>
  );
}
