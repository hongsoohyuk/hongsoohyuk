import {getTranslations, setRequestLocale} from 'next-intl/server';

import type {Metadata} from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Guestbook');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function GuestbookLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <div className="container mx-auto px-0 py-0 md:px-4 md:py-8 max-w-3xl">{children}</div>;
}
