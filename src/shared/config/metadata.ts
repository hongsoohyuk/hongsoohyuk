import {SITE_CONFIG} from './site';

import type {Metadata} from 'next';

/**
 * Shared Metadata Configuration
 *
 * Base metadata for the entire application
 * Following FSD principles - metadata is shared configuration
 */

export const baseMetadata: Metadata = {
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
