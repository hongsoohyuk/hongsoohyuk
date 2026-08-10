import {ContentSurface} from '@/components/content/content-surface';
import {PageHeader} from '@/components/layout/page-header';
import {Skeleton} from '@/components/ui/skeleton';
import {SkeletonText} from '@/components/ui/skeleton-text';

export default function BlogDetailLoading() {
  return (
    <section className="space-y-6">
      <PageHeader className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-2/3" />

        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
      </PageHeader>

      <ContentSurface className="space-y-6 h-screen">
        <SkeletonText lines={3} />
        <SkeletonText lines={3} />
        <Skeleton className="h-8 w-40" />
        <SkeletonText lines={2} />
      </ContentSurface>
    </section>
  );
}
