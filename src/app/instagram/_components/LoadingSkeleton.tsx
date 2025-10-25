import {Skeleton} from '@/component/ui/skeleton';

interface LoadingSkeletonProps {
  count?: number;
  aspectRatioClass?: string;
}

export function LoadingSkeleton({count = 3, aspectRatioClass = 'aspect-[4/5]'}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({length: count}).map((_, index) => (
        <div key={`loading-${index}`} className="relative overflow-hidden">
          <div className={`${aspectRatioClass} relative w-full`}>
            <Skeleton aria-label="Loading post" className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      ))}
    </>
  );
}
