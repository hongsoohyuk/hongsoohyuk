import {SITE_CONFIG} from '@/config/site';

type JsonLdData = Record<string, unknown>;

const PERSON_ID = `${SITE_CONFIG.url}/#person`;

export function JsonLd({data}: {data: JsonLdData | JsonLdData[]}) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be embedded as a raw script; escape `<` to prevent tag injection
      dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}}
    />
  );
}

export function personJsonLd(): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: '홍수혁',
    alternateName: 'Soohyuk Hong',
    url: SITE_CONFIG.url,
    jobTitle: 'Frontend Developer',
    sameAs: [SITE_CONFIG.links.github, SITE_CONFIG.links.linkedin],
  };
}

export function websiteJsonLd(): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    inLanguage: ['ko', 'en'],
    publisher: {'@id': PERSON_ID},
  };
}

export function blogPostingJsonLd({
  title,
  description,
  path,
  locale,
  datePublished,
  dateModified,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  locale: string;
  datePublished?: string;
  dateModified?: string;
  keywords?: string[];
}): JsonLdData {
  const url = `${SITE_CONFIG.url}${path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    mainEntityOfPage: {'@type': 'WebPage', '@id': url},
    inLanguage: locale,
    ...(datePublished ? {datePublished} : {}),
    ...(dateModified ? {dateModified} : {}),
    ...(keywords && keywords.length > 0 ? {keywords: keywords.join(', ')} : {}),
    author: {'@type': 'Person', name: '홍수혁', url: SITE_CONFIG.url},
    image: `${SITE_CONFIG.url}/${SITE_CONFIG.ogImage}`,
  };
}

export function creativeWorkJsonLd({
  title,
  description,
  path,
  locale,
  dateCreated,
  dateModified,
}: {
  title: string;
  description?: string;
  path: string;
  locale: string;
  dateCreated?: string;
  dateModified?: string;
}): JsonLdData {
  const url = `${SITE_CONFIG.url}${path}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    url,
    inLanguage: locale,
    ...(description ? {description} : {}),
    ...(dateCreated ? {dateCreated} : {}),
    ...(dateModified ? {dateModified} : {}),
    author: {'@type': 'Person', name: '홍수혁', url: SITE_CONFIG.url},
  };
}

export function breadcrumbJsonLd(items: Array<{name: string; path: string}>): JsonLdData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.path}`,
    })),
  };
}
