import {PageContainer} from '@/components/layout/page-container';
import {Skeleton} from '@/components/ui/skeleton';
import {SkeletonText} from '@/components/ui/skeleton-text';
import {StatTile, StatTileLabel, StatTileValue} from '@/components/ui/stat-tile';

export default function StatsLoading() {
  return (
    <PageContainer asChild size="content" className="py-8">
      <main>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>

        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({length: 4}, (_, i) => (
            <StatTile key={i}>
              <StatTileLabel>
                <Skeleton className="h-4 w-16" />
              </StatTileLabel>
              <StatTileValue>
                <Skeleton className="h-8 w-20" />
              </StatTileValue>
            </StatTile>
          ))}
        </section>

        <section className="mt-8">
          <Skeleton className="mb-3 h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </section>

        <section className="mt-8">
          <Skeleton className="mb-3 h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </section>

        <section className="mt-8">
          <Skeleton className="mb-3 h-6 w-32" />
          <Skeleton className="h-40 w-full" />
        </section>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <Skeleton className="mb-3 h-6 w-24" />
            <SkeletonText lines={5} />
          </section>
          <section>
            <Skeleton className="mb-3 h-6 w-24" />
            <SkeletonText lines={5} />
          </section>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <Skeleton className="mb-3 h-6 w-24" />
            <SkeletonText lines={5} />
          </section>
          <section>
            <Skeleton className="mb-3 h-6 w-24" />
            <SkeletonText lines={5} />
          </section>
        </div>

        <section className="mt-8">
          <Skeleton className="mb-3 h-6 w-32" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}, (_, i) => (
              <StatTile key={i}>
                <div className="flex items-baseline justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="mt-3 h-2 w-full rounded-full" />
                <Skeleton className="mt-3 h-7 w-full" />
              </StatTile>
            ))}
          </div>
        </section>
      </main>
    </PageContainer>
  );
}
