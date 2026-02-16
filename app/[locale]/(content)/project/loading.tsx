import {Card, CardContent} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';

export default function ProjectLoading() {
  return (
    <div className="flex flex-col gap-6 ">
      {Array.from({length: 3}).map((_, i) => (
        <Card key={`project-loading-skeleton-${i}`} className="flex-1 min-h-0 overflow-hidden py-2">
          <CardContent className="h-full overflow-hidden">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
