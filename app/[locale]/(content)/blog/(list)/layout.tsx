import {getTranslations, setRequestLocale} from 'next-intl/server';

import {PageHeader, PageHeaderDescription, PageHeaderTitle} from '@/components/layout/page-header';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function BlogListLayout({children, params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Blog'});
  setRequestLocale(locale);

  return (
    <article className="flex flex-col gap-4">
      <PageHeader layout="inline" className="space-y-2 shrink-0 flex-nowrap gap-2">
        <PageHeaderTitle>{t('title')}</PageHeaderTitle>
        <PageHeaderDescription>{t('description')}</PageHeaderDescription>
      </PageHeader>
      {children}
    </article>
  );
}
