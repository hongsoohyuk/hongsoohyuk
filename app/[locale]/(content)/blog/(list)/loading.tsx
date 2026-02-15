import {Card, CardContent} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {BlogSearchFilter} from '@/features/blog';

export default function BlogLoading() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100dvh-10rem)]">
      <BlogSearchFilter disabled />

      <Card className="flex-1 min-h-0 overflow-hidden">
        <CardContent>
          {Array.from({length: 5}).map((_, i) => (
            <div key={`blog-loading-skeleton-${i}`} className="space-y-2 py-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
