import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';

import {BlogContent, BlogSearchFilter} from '@/features/blog';
import {getBlogList} from '@/features/blog/api';

export const revalidate = 21600; // 6 hours

type Props = {
  params: Promise<{locale: string}>;
};

export default async function BlogPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Blog'}), getBlogList()]);

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
