import {Skeleton} from '@/components/ui/skeleton';

export default function ProjectLoading() {
  return (
    <div className="flex flex-col">
      {Array.from({length: 3}).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key -- 정적 길이의 스켈레톤은 데이터 키가 없음
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
