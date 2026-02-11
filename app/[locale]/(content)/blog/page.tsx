import {Suspense} from 'react';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getBlogList} from '@/features/blog/api';
import {BlogContent, BlogSearchFilter} from '@/features/blog';

import {Card, CardContent} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {createPageMetadata} from '@/config';

export const revalidate = 21600; // 6 hours

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Seo'});

  return createPageMetadata({
    title: t('blog.title'),
    description: t('blog.description'),
    path: locale === 'ko' ? '/blog' : `/${locale}/blog`,
    locale,
    keywords: ['블로그', '개발 블로그', '프론트엔드', 'Tech Blog', 'Frontend', 'Next.js'],
  });
}

export default async function BlogPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Blog'}), getBlogList()]);

  return (
    <div className="flex flex-col gap-6 h-[calc(100dvh-10rem)]">
      <div className="shrink-0">
        <Suspense>
          <BlogSearchFilter />
        </Suspense>
      </div>

      <Card className="flex-1 min-h-0 overflow-hidden">
        <CardContent className="h-full overflow-hidden">
          <ScrollArea className="h-full">
            <Suspense>
              <BlogContent posts={data.items} emptyText={t('empty')} />
            </Suspense>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
