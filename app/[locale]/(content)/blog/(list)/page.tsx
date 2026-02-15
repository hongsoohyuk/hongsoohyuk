import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';

import {BlogContent, BlogSearchFilter} from '@/features/blog';
import {getBlogList} from '@/features/blog/api';

import {Card, CardContent} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';

export const revalidate = 21600; // 6 hours

type Props = {
  params: Promise<{locale: string}>;
};

export default async function BlogPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Blog'}), getBlogList()]);

  return (
    <div className="flex flex-col gap-6 h-[calc(100dvh-16rem)]">
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
