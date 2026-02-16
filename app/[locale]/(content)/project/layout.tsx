import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function ProjectLayout({children, params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Project'});
  setRequestLocale(locale);

  return (
    <article className="flex flex-col gap-4">
      <header className="space-y-2 shrink-0 flex items-baseline gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </header>
      {children}
    </article>
  );
}
