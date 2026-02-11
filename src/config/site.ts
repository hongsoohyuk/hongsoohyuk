// Application constants
export const SITE_CONFIG = {
  name: 'hongsoohyuk',
  description: '개인 포트폴리오와 방명록이 있는 개인 사이트',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: 'og.jpg',
  links: {
    github: 'https://github.com/hong-soohyuk',
    linkedin: 'https://linkedin.com/in/hong-soohyuk',
  },
} as const;

export const NAVIGATION_ITEMS = [
  {name: '홈', href: '/'},
  {name: '프로젝트', href: '/project'},
  {name: '방명록', href: '/guestbook'},
  {name: '인스타그램', href: '/instagram'},
] as const;

export const API_ENDPOINTS = {
  chat: '/api/chat',
  guestbook: '/api/guestbook',
  project: '/api/project',
  instagram: '/api/instagram',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
