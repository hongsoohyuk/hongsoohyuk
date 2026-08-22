'use client';

import {BlogFilterBar} from './blog-filter-bar';
import {useSearchFilterParams} from '../_lib/use-search-filter-params';

// useSearchParams를 읽으므로 정적 렌더 시 클라이언트로 넘어간다.
// 프리렌더용 자리는 page.tsx가 Suspense fallback으로 BlogFilterBar를 직접 그린다.
export function BlogSearchFilter() {
  const {currentQuery, currentCategory, handleSearch, handleCategoryClick, clearCategory} = useSearchFilterParams();

  return (
    <BlogFilterBar
      query={currentQuery}
      category={currentCategory}
      onSearch={handleSearch}
      onCategoryClick={handleCategoryClick}
      onClear={clearCategory}
    />
  );
}
