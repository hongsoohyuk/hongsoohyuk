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
    title: t('blog.title'),
    description: t('blog.description'),
    path: locale === 'ko' ? '/blog' : `/${locale}/blog`,
    locale,
    keywords: ['블로그', '개발 블로그', '프론트엔드', 'Tech Blog', 'Frontend', 'Next.js'],
  });
}

export default async function BlogLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <div className="container mx-auto px-0 py-0 md:px-2 md:py-4 max-w-3xl">{children}</div>;
}
