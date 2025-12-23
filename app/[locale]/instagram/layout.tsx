import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import React from 'react';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Instagram');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function InstagramLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <React.Fragment>{children}</React.Fragment>;
}
