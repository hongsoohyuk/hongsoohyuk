import {Skeleton} from '@/components/ui/skeleton';

export default function ProjectLoading() {
  return (
    <div className="flex flex-col">
      {Array.from({length: 3}).map((_, i) => (
        <div key={`project-loading-skeleton-${i}`} className="py-4 border-b border-border/50 space-y-2">
          <div className="flex items-baseline justify-between gap-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
