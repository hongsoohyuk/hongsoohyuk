import {getTranslations, setRequestLocale} from 'next-intl/server';

import {createPageMetadata} from '@/config';

import type {Metadata} from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: 'Seo'});

  return createPageMetadata({
    title: t('resume.title'),
    description: t('resume.description'),
    path: locale === 'ko' ? '/resume' : `/${locale}/resume`,
    locale,
    keywords: ['이력서', '프론트엔드 개발자', 'Resume', 'Frontend Developer', 'React', 'Next.js', 'TypeScript'],
  });
}

export default async function ResumeLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <article>{children}</article>;
}
