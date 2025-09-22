// Application constants
export const SITE_CONFIG = {
  name: 'hongsoohyuk',
  description: '개인 포트폴리오와 방명록이 있는 개인 사이트',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: 'og.jpg',
  links: {
    github: 'https://github.com/hong-soohyuk',
    linkedin: 'https://linkedin.com/in/hong-soohyuk',
    instagram: 'https://instagram.com/hongsoohyuk',
  },
} as const;

export const NAVIGATION_ITEMS = [
  {name: '홈', href: '/'},
  {name: '포트폴리오', href: '/portfolio'},
  {name: '방명록', href: '/guestbook'},
  {name: '인스타그램', href: '/instagram'},
] as const;

export const API_ENDPOINTS = {
  guestbook: '/api/guestbook',
  portfolio: '/api/portfolio',
  instagram: '/api/instagram',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Social media links (to be configured)
export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME || 'hongsoohyuk',
  googleDocs: process.env.NEXT_PUBLIC_GOOGLE_DOCS_ID || '',
} as const;
