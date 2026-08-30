import {Suspense} from 'react';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getBlogList} from '@/lib/content/blog';
import {BlogContent} from '../_components/blog-content';
import {BlogFilterBar} from '../_components/blog-filter-bar';
import {BlogFilteredContent} from '../_components/blog-filtered-content';
import {BlogSearchFilter} from '../_components/blog-search-filter';
import {filterBlogPosts} from '../_lib/filter-posts';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function BlogPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Blog'}), getBlogList()]);
  const publicPosts = filterBlogPosts(data.items, {});

  // 두 자식 모두 useSearchParams를 읽어 정적 렌더 시 클라이언트로 넘어간다.
  // fallback에 공개 목록과 필터 UI를 그대로 그려 프리렌더 HTML을 완성시킨다(SEO/레이아웃 안정).
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<BlogFilterBar query="" category="" />}>
        <BlogSearchFilter />
      </Suspense>

      <Suspense fallback={<BlogContent posts={publicPosts} emptyText={t('empty')} />}>
        <BlogFilteredContent posts={data.items} emptyText={t('empty')} />
      </Suspense>
    </div>
  );
}
