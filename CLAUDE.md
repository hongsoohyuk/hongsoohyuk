# 프로젝트 가이드

## 기술 스택

- Next.js 16.1 + React 19 + Turbopack
- Tailwind CSS 4 + Radix UI
- TanStack React Query
- @notionhq/client (Notion API)
- **Bulletproof React 아키텍처**
- next-intl 국제화

## Bulletproof React 구조

```
src/
├── app/              # Next.js App Router + Providers
│   └── providers/    # 전역 Provider (Query, Theme 등)
│
├── features/         # 🎯 핵심: 기능별 모듈
│   ├── project/      # 프로젝트 (Notion 연동)
│   ├── guestbook/    # 방명록
│   ├── instagram/    # 인스타그램 피드
│   ├── emotion/      # 이모션 선택
│   └── home/         # 홈 페이지
│
├── components/       # 공유 UI 컴포넌트
│   ├── ui/           # 기본 UI (Button, Card, Dialog 등)
│   └── layout/       # 레이아웃 (Header, Footer)
│
├── hooks/            # 공유 커스텀 훅
├── lib/              # 라이브러리 설정 (API 클라이언트 등)
├── config/           # 환경 설정
├── types/            # 공유 타입 정의
└── utils/            # 유틸리티 함수
```

## Feature 폴더 구조

각 feature는 독립적인 모듈로 구성:

```
src/features/[feature-name]/
├── api/              # API 호출 함수 및 훅
├── components/       # feature 전용 컴포넌트
├── hooks/            # feature 전용 훅
├── types/            # feature 전용 타입
├── utils/            # feature 전용 유틸리티
├── __tests__/        # 테스트
└── index.ts          # Public API (named exports)
```

## 의존성 규칙

```
shared (components, hooks, lib, utils, config, types)
    ↓
features (feature 간 import 금지)
    ↓
app (라우트에서 feature import)
```

- ✅ features → shared (허용)
- ✅ app → features, shared (허용)
- ❌ features → features (금지: feature 간 교차 import)
- ❌ shared → features (금지)

## App Router 연결

```tsx
// app/[locale]/instagram/page.tsx
export {InstagramPage as default} from '@/features/instagram';
```

## 코드 컨벤션

- 직접 경로 import (barrel file 최소화)
- ESLint Bulletproof React import order 적용
- Prettier 포맷팅
- 파일명: kebab-case (예: `instagram-feed.tsx`)

## 개발 명령어

```bash
pnpm dev --port 3000   # 개발 서버
pnpm build             # 빌드
pnpm test              # Jest 단위 테스트
pnpm test:e2e          # Playwright E2E 테스트
pnpm lint              # ESLint
pnpm format            # Prettier
```

## Notion API 참고

- Database Query: `notion.databases.query()`
- Page Retrieve: `notion.pages.retrieve()`
- Block Children: `notion.blocks.children.list()`
