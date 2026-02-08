import {SITE_CONFIG} from './site';

import type {Metadata} from 'next';

/**
 * Shared Metadata Configuration
 *
 * Base metadata for the entire application
 * Following FSD principles - metadata is shared configuration
 */

const LOCALE_MAP: Record<string, string> = {
  ko: 'ko_KR',
  en: 'en_US',
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
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
    images: [{url: `/${SITE_CONFIG.ogImage}`, width: 1200, height: 630, alt: SITE_CONFIG.name}],
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

type OGImage = {url: string; width?: number; height?: number; alt?: string};

/**
 * Generate page-specific metadata with proper OG tags, canonical URL, and alternates.
 */
export function createPageMetadata({
  title,
  description,
  path,
  locale,
  keywords,
  images,
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  locale: string;
  keywords?: string[];
  images?: OGImage[];
  type?: 'website' | 'article';
}): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  const ogLocale = LOCALE_MAP[locale] || 'ko_KR';
  const alternateLocale = locale === 'ko' ? 'en' : 'ko';
  const alternatePath = locale === 'ko' ? `/en${path}` : path.replace(/^\/en/, '') || '/';

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        [alternateLocale]: `${SITE_CONFIG.url}${alternatePath}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: ogLocale,
      type,
      ...(images ? {images} : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(images ? {images} : {}),
    },
  };

  if (keywords) {
    metadata.keywords = keywords;
  }

  return metadata;
}
