import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getBlogDetail, getBlogList} from '@/features/blog/api';

import {ArrowLeftIcon} from 'lucide-react';

import {NotionBlocks} from '@/components/notion/notion-blocks';
import {Badge} from '@/components/ui/badge';
import {createPageMetadata} from '@/config';
import {locales} from '@/lib/i18n/config';
import {Link} from '@/lib/i18n/routing';

export const revalidate = 21600; // 6 hours

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export async function generateStaticParams() {
  const data = await getBlogList();
  return data.items.flatMap((item) => locales.map((locale) => ({locale, slug: item.slug})));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;

  try {
    const [data, listData] = await Promise.all([getBlogDetail(slug), getBlogList()]);
    const listItem = listData.items.find((item) => item.slug === slug);
    const description = listItem?.excerpt || `${data.meta.title} - ${data.meta.categories.join(', ')}`;

    return createPageMetadata({
      title: data.meta.title,
      description,
      path: locale === 'ko' ? `/blog/${slug}` : `/${locale}/blog/${slug}`,
      locale,
      keywords: data.meta.categories,
      type: 'article',
    });
  } catch {
    return {
      title: 'Blog',
    };
  }
}

export default async function BlogDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Blog'}), getBlogDetail(slug)]);

  const formattedDate = new Date(data.meta.lastEditedTime).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/blog" className="inline-flex items-center gap-1 hover:underline">
            <ArrowLeftIcon className="size-3.5" />
            {t('title')}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-foreground truncate">{data.meta.title}</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">{data.meta.title}</h1>
        {data.meta.categories.length > 0 && (
          <div className="flex gap-1.5">
            {data.meta.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground">{t('lastEdited', {date: formattedDate})}</p>
      </header>

      {data.blocks.length > 0 && (
        <section className="rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-6 md:p-8">
          <NotionBlocks blocks={data.blocks} />
        </section>
      )}
    </section>
  );
}
