
import {baseMetadata, getFontClassNames} from '@/shared/config';
import {routing} from '@/shared/i18n/routing';
import {TURNSTILE_SCRIPT_ID, TURNSTILE_SCRIPT_SRC} from '@/shared/turnstile';
import {Footer} from '@/shared/ui/layout/footer';
import {Header} from '@/shared/ui/layout/header';
import {SilkBackground} from '@/shared/ui/silk-background';
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import Script from 'next/script';
import '../globals.css';
import {ThemeProvider} from 'next-themes';

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
      <head>
        <Script id={TURNSTILE_SCRIPT_ID} src={TURNSTILE_SCRIPT_SRC} strategy="beforeInteractive" defer async />
      </head>
      <body className={`${getFontClassNames()} antialiased min-h-screen bg-background font-sans flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SilkBackground />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
