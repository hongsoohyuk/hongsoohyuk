import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {getProjectDetail} from '@/entities/project/api/pages/get-project-detail';
import {NotionBlocks} from '@/entities/project/ui/notion/NotionBlocks';

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

export async function ProjectDetailPage({params}: Props) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Project'});
  const data = await getProjectDetail(slug);

  const formattedDate = data.meta.lastEditedTime
    ? new Date(data.meta.lastEditedTime).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
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
          <section className="pt-4">
            <NotionBlocks blocks={data.blocks} />
          </section>
        )}
      </div>
    </div>
  );
}
