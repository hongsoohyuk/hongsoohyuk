import {Suspense} from 'react';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getBlogList, BlogPostCard, BlogSearchFilter} from '@/features/blog';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{q?: string; category?: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Blog'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function BlogPage({params, searchParams}: Props) {
  const {locale} = await params;
  const {q, category} = await searchParams;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([
    getTranslations({locale, namespace: 'Blog'}),
    getBlogList({q, category}),
  ]);

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-6">{t('title')}</h1>
          <Suspense>
            <BlogSearchFilter />
          </Suspense>
        </header>

        {data.items.length > 0 ? (
          <section>
            <div className="flex flex-col">
              {data.items.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        ) : (
          <section className="py-12">
            <p className="text-muted-foreground">{t('empty')}</p>
          </section>
        )}
      </div>
    </div>
  );
}
