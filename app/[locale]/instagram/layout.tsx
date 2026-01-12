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
    keywords: [
      '남자',
      '패션',
      '데이트룩',
      'ootd',
      '오오티디',
      '느좋',
      '느좋남',
      '남자 패션',
      '남자 데이트룩',
      'man',
      'fashion',
      'date outfit',
      'ootd',
      'outfit of the day',
      'man fashion',
      'man date outfit',
    ],
  };
}

export default async function InstagramLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <div className="container mx-auto px-4 py-8 max-w-3xl ">{children}</div>;
}
