import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';

import {BlogContent, BlogSearchFilter} from '@/features/blog';
import {getBlogList} from '@/features/blog/api';

export const revalidate = 21600; // 6 hours

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogPage({params, searchParams}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;

  const [t, data] = await Promise.all([
    getTranslations({locale, namespace: 'Blog'}),
    getBlogList({q, category}),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <BlogSearchFilter />
      </Suspense>

      <Suspense>
        <BlogContent posts={data.items} emptyText={t('empty')} />
      </Suspense>
    </div>
  );
}
