import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getProjectDetail, NotionBlocks} from '@/features/project';

import {Link} from '@/lib/i18n/routing';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params;

  try {
    const data = await getProjectDetail(slug);
    return {
      title: data.meta.title,
    };
  } catch {
    return {
      title: 'Project Detail',
    };
  }
}

export default async function ProjectDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([
    getTranslations({locale, namespace: 'Project'}),
    getProjectDetail(slug),
  ]);

  const formattedDate = data.meta.lastEditedTime
    ? new Date(data.meta.lastEditedTime).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6 px-4 md:px-0 py-4 md:py-0">
      <div className="text-sm">
        <Link href="/project" className="text-muted-foreground hover:underline">
          ← {t('backToList')}
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{data.meta.title}</h1>
        {formattedDate && <p className="text-sm text-muted-foreground">{t('lastEdited', {date: formattedDate})}</p>}
      </header>

      {data.blocks.length > 0 && (
        <section className="rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-6 md:p-8">
          <NotionBlocks blocks={data.blocks} />
        </section>
      )}
    </div>
  );
}
