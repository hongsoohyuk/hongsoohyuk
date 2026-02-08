import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getBlogDetail} from '@/features/blog';

import {NotionBlocks} from '@/components/notion/notion-blocks';
import {Badge} from '@/components/ui/badge';
import {Link} from '@/lib/i18n/routing';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;

  try {
    const data = await getBlogDetail(slug);
    return {
      title: data.meta.title,
    };
  } catch {
    return {
      title: 'Blog',
    };
  }
}

export default async function BlogDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([
    getTranslations({locale, namespace: 'Blog'}),
    getBlogDetail(slug),
  ]);

  const formattedDate = new Date(data.meta.lastEditedTime).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-sm">
          <Link href="/blog" className="text-muted-foreground hover:underline">
            &larr; {t('backToList')}
          </Link>
        </div>

        <header className="space-y-3">
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
          <section className="pt-4">
            <NotionBlocks blocks={data.blocks} />
          </section>
        )}
      </div>
    </div>
  );
}
