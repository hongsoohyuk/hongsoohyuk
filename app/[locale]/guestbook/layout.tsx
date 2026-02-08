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
    title: t('guestbook.title'),
    description: t('guestbook.description'),
    path: locale === 'ko' ? '/guestbook' : `/${locale}/guestbook`,
    locale,
  });
}

export default async function GuestbookLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <div className="container mx-auto px-0 py-0 md:px-2 md:py-4 max-w-3xl">{children}</div>;
}
