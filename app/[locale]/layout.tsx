import {baseMetadata, getFontClassNames} from '@/config';
import {routing} from '@/lib/i18n/routing';
import {Footer} from '@/components/layout/footer';
import {Header} from '@/components/layout/header';
import {Analytics} from '@vercel/analytics/next';
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {ThemeProvider} from 'next-themes';

import '../globals.css';

export const metadata: Metadata = baseMetadata;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${getFontClassNames()} antialiased min-h-screen bg-background font-sans flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
