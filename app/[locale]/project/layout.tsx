import {setRequestLocale} from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function ProjectLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return <div className="container mx-auto px-0 py-0 md:px-2 md:py-4 max-w-3xl">{children}</div>;
}
