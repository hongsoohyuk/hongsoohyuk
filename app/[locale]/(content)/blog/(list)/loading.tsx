import {Suspense} from 'react';

import {ContentListRowSkeleton} from '@/components/content/content-list-row';
import {ItemGroup} from '@/components/ui/item';

import {BlogSearchFilter} from '../_components/blog-search-filter';

export default function BlogLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <BlogSearchFilter disabled />
      </Suspense>

      <ItemGroup>
        {Array.from({length: 5}).map((_, i) => (
          <ContentListRowSkeleton key={`blog-loading-skeleton-${i}`} />
        ))}
      </ItemGroup>
    </div>
  );
}
