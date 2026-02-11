// Application constants
export const SITE_CONFIG = {
  name: 'hongsoohyuk',
  description: '개인 포트폴리오와 방명록이 있는 개인 사이트',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: 'og.jpg',
  links: {
    github: 'https://github.com/hongsoohyuk',
    linkedin: 'https://www.linkedin.com/in/soohyuk-hong-569020228/',
  },
} as const;
