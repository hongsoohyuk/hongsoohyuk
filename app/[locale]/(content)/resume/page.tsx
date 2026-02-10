import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

import {NotionBlocks} from '@/components/notion';
import {createPageMetadata} from '@/config';
import {getResumePage} from '@/features/resume/api';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Seo'});

  return createPageMetadata({
    title: t('resume.title'),
    description: t('resume.description'),
    path: locale === 'ko' ? '/resume' : `/${locale}/resume`,
    locale,
    keywords: ['이력서', '프론트엔드 개발자', 'Resume', 'Frontend Developer', 'React', 'Next.js', 'TypeScript'],
  });
}

export default async function ResumePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations({locale, namespace: 'Resume'}), getResumePage()]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>

      {data.blocks.length > 0 && (
        <section className="rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-6 md:p-8">
          <NotionBlocks blocks={data.blocks} />
        </section>
      )}
    </div>
  );
}
