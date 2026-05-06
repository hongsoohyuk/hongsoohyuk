import {Footer} from '@/components/layout/footer';
import {Header} from '@/components/layout/header';
import {WebViewShell} from '@/components/layout/webview-shell';
import {baseMetadata, getFontClassNames} from '@/config';
import {routing} from '@/lib/i18n/routing';
import {Analytics} from '@vercel/analytics/next';
import {SpeedInsights} from '@vercel/speed-insights/next';
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
};

export default async function LocaleLayout({children}: Props) {
  return (
    <html suppressHydrationWarning>
      <body className={`${getFontClassNames()} antialiased min-h-screen bg-background font-sans flex flex-col`}>
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <WebViewShell header={<Header />} footer={<Footer />}>
              {children}
            </WebViewShell>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
