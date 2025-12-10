import {Footer} from '@/component/layout/footer';
import {Header} from '@/component/layout/header';
import {routing} from '@/i18n/routing';
import {SITE_CONFIG} from '@/lib/constants';
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {Geist, Geist_Mono} from 'next/font/google';
import {ClientProviders} from '@/component/common/providers/client-providers';
import {ThemeScript} from '@/component/common/theme-script';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ['포트폴리오', '개인사이트', '개발자', '프론트엔드', 'Next.js', 'Portfolio', 'Developer'],
  authors: [{name: '홍수혁'}],
  creator: '홍수혁',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    creator: '@hongsoohyuk',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

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
        <ThemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>
            <div className="relative flex min-h-screen flex-col">
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
