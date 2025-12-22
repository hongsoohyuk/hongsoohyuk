import {ClientProviders} from '@/app/providers/client-providers';
import {baseMetadata, getFontClassNames} from '@/shared/config';
import {routing} from '@/shared/i18n/routing';
import {ThemeScript} from '@/shared/theme/config/theme-script';
import {TURNSTILE_SCRIPT_ID, TURNSTILE_SCRIPT_SRC} from '@/shared/turnstile';
import {Footer} from '@/shared/ui/layout/footer';
import {Header} from '@/shared/ui/layout/header';
import {SilkBackground} from '@/shared/ui/silk-background';
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {cookies} from 'next/headers';
import Script from 'next/script';
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
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const initialThemeClass = themeCookie === 'dark' ? 'dark' : themeCookie === 'light' ? 'light' : undefined;

  return (
    <html lang={locale} className={initialThemeClass} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <Script id={TURNSTILE_SCRIPT_ID} src={TURNSTILE_SCRIPT_SRC} strategy="beforeInteractive" defer async />
      </head>
      <body className={`${getFontClassNames()} antialiased min-h-screen bg-background font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>
            <SilkBackground />
            <div className="relative z-10 flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
