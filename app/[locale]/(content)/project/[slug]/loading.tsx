import {ContentSurface} from '@/components/content/content-surface';
import {PageHeader} from '@/components/layout/page-header';
import {Skeleton} from '@/components/ui/skeleton';
import {SkeletonText} from '@/components/ui/skeleton-text';

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      <PageHeader>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-32" />
      </PageHeader>

      <ContentSurface className="space-y-6 h-screen">
        <SkeletonText />
        <SkeletonText />
        <Skeleton className="h-8 w-40" />
        <SkeletonText lines={2} />
      </ContentSurface>
    </div>
  );
}
