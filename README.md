# hongsoohyuk

Next.js 16과 React 19를 활용한 개인 포트폴리오 사이트

## 주요 기능

- **프로젝트**: Notion API 연동 프로젝트 포트폴리오
- **블로그**: Notion 기반 블로그 (SSG, ISR)
- **방명록**: 방문자 메시지
- **인스타그램**: 인스타그램 피드 연동
- **이력서**: 이력서 페이지
- **다국어 지원**: 한국어 / English (next-intl)
- **다크 모드**: 시스템 테마 연동

## 기술 스택

- **Framework**: Next.js 16.1 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, Radix UI
- **Data Fetching**: TanStack React Query, @notionhq/client
- **i18n**: next-intl
- **Architecture**: Bulletproof React
- **Language**: TypeScript

## 프로젝트 구조

```
src/
├── app/              # Providers
├── features/         # 기능별 모듈
│   ├── blog/         # 블로그 (Notion)
│   ├── project/      # 프로젝트 (Notion)
│   ├── guestbook/    # 방명록
│   ├── instagram/    # 인스타그램 피드
│   ├── resume/       # 이력서
│   └── home/         # 홈
├── components/       # 공유 UI 컴포넌트
│   ├── ui/           # 기본 UI (Button, Card 등)
│   └── layout/       # Header, Footer
├── hooks/            # 공유 커스텀 훅
├── lib/              # 라이브러리 설정
├── config/           # 환경 설정
├── types/            # 공유 타입
└── utils/            # 유틸리티

app/[locale]/         # App Router 라우트
├── blog/             # /blog, /blog/[slug]
├── project/          # /project, /project/[slug]
├── guestbook/        # /guestbook
├── instagram/        # /instagram
└── resume/           # /resume
```

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버
pnpm dev --port 3000

# 빌드
pnpm build

# 린트 / 포맷
pnpm lint
pnpm format

# 테스트
pnpm test
pnpm test:e2e
```

## 배포

Vercel에서 자동 배포

## 링크

- [GitHub](https://github.com/hong-soohyuk)
- [LinkedIn](https://linkedin.com/in/hong-soohyuk)
