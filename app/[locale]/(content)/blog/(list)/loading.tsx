import {Suspense} from 'react';

import {Skeleton} from '@/components/ui/skeleton';
import {BlogSearchFilter} from '../_components/blog-search-filter';

export default function BlogLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <BlogSearchFilter disabled />
      </Suspense>

      <div className="flex flex-col">
        {Array.from({length: 5}).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key -- 정적 길이의 스켈레톤은 데이터 키가 없음
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
