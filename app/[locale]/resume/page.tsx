import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {NotionBlocks} from '@/components/notion';
import {getResumePage} from '@/features/resume';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Resume'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ResumePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([
    getTranslations({locale, namespace: 'Resume'}),
    getResumePage(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
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
