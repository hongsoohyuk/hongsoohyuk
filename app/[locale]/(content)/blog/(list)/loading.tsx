import {Skeleton} from '@/components/ui/skeleton';
import {BlogSearchFilter} from '@/features/blog';

export default function BlogLoading() {
  return (
    <div className="flex flex-col gap-6">
      <BlogSearchFilter disabled />

      <div className="flex flex-col">
        {Array.from({length: 5}).map((_, i) => (
          <div key={`blog-loading-skeleton-${i}`} className="py-4 border-b border-border/50 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
