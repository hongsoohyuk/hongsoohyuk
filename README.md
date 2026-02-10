# hongsoohyuk.com

프론트엔드 개발자 홍수혁의 포트폴리오 사이트

## 기술 스택

- **Framework**: Next.js 16.1 (App Router + Turbopack)
- **UI**: React 19, Tailwind CSS v4, Radix UI
- **Data**: TanStack React Query, Notion API, Supabase
- **AI**: Vercel AI SDK + Anthropic Claude
- **i18n**: next-intl
- **Testing**: Jest, Playwright
- **Architecture**: Bulletproof React + React Compiler

## 주요 기능

- **블로그** — Notion API 기반 블로그 (ISR)
- **프로젝트** — Notion 연동 프로젝트 쇼케이스
- **방명록** — Supabase 기반 방명록 + 이모션 선택
- **인스타그램** — Instagram Graph API 피드
- **이력서** — Notion 기반 이력서 페이지
- **CLI 터미널** — 인터랙티브 웹 터미널 (파일시스템, vim 에디터)
- **AI 채팅** — 플로팅 AI 어시스턴트 (Claude Haiku)

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router + Providers
├── features/             # 기능별 독립 모듈
│   ├── ai-chat/          # AI 채팅 플로터
│   ├── blog/             # 블로그
│   ├── command-line/     # CLI 터미널
│   ├── guestbook/        # 방명록
│   ├── home/             # 홈페이지
│   ├── instagram/        # 인스타그램 피드
│   ├── project/          # 프로젝트
│   └── resume/           # 이력서
├── components/           # 공유 UI (Button, Card, Dialog ...)
├── hooks/                # 공유 커스텀 훅
├── lib/                  # 라이브러리 설정 (API, i18n, security)
├── config/               # 환경 설정
├── types/                # 공유 타입
└── utils/                # 유틸리티 함수
```

### 의존성 규칙

```
shared (components, hooks, lib, utils, config, types)
    ↓
features (feature 간 import 금지)
    ↓
app (라우트에서 feature import)
```

## 시작하기

### 요구사항

- Node.js 18.17+
- pnpm

### 설치

```bash
pnpm install
```

### 개발

```bash
pnpm dev              # 개발 서버 (Turbopack)
pnpm build            # 프로덕션 빌드
pnpm lint             # ESLint
pnpm format           # Prettier + ESLint fix
pnpm test             # Jest 단위 테스트
pnpm test:e2e         # Playwright E2E 테스트
```

