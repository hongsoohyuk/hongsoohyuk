import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Guestbook');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

/**
 * Guestbook Layout
 *
 * Provides guestbook-specific layout configuration
 * - Custom metadata for SEO
 * - Guestbook-specific styling (if needed)
 * - Analytics tracking (if needed)
 */
export default async function GuestbookLayout({children, params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <div className="guestbook-layout">
      {/* Guestbook-specific wrapper */}
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
