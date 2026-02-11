import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function BlogLayout({children, params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Blog'});
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-0 py-0 md:px-2 md:py-4 max-w-3xl flex flex-col gap-4">
      <header className="space-y-2 shrink-0">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </header>
      {children}
    </div>
  );
}
