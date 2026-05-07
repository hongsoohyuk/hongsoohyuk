# 프로젝트 가이드

## 기술 스택

- Next.js 16.1 + React 19 + Turbopack
- Tailwind CSS 4 + Radix UI
- @notionhq/client (Notion API)
- next-intl 국제화

## Route-Colocated 구조

각 라우트는 자기 UI/로직을 소유한다.

```
app/
├── [locale]/<route>/
│   ├── page.tsx, layout.tsx, ...
│   ├── _components/         # 라우트 전용 UI (kebab-case)
│   └── _lib/                # 라우트 전용 데이터/훅/스토어/타입
├── api/<route>/
│   ├── route.ts
│   └── _lib/                # route handler 보조 로직
└── globals.css

src/
├── components/
│   ├── ui/                  # shadcn primitives
│   ├── layout/              # 글로벌 레이아웃
│   ├── notion/              # cross-route 공유 (Notion 렌더)
│   └── mdx-components.tsx
├── hooks/                   # cross-route 공유 훅
├── lib/
│   ├── api/                 # 외부 API 클라이언트 (supabase, notion, spotify, ...)
│   ├── content/             # blog/project/resume 데이터 페처 (cross-route)
│   ├── i18n/, security/, turnstile/, webview/
├── config/, types/, utils/
```

`_components/`와 `_lib/` 두 폴더만 사용한다. 같은 종류 파일이 10개 이상 모이면 그때 분할.

## 의존성 규칙

- `app/` → `src/` 단방향. `src/`는 `app/`을 import 하지 않음.
- 라우트 자기 코드(`_components`, `_lib`)는 같은 라우트 내부 또는 `src/`만 import.
- 두 개 이상의 라우트(또는 sitemap, api route)에서 import 되면 → `src/`로 추출.

## React Compiler (필수)

- **React Compiler 사용** (`next.config.ts`에 `reactCompiler: true` 설정됨)
- `memo`, `useMemo`, `useCallback`을 수동으로 사용하지 않음 — React Compiler가 자동 처리
- 새 코드 작성 시 plain function/variable로 작성, 컴파일러가 최적화 판단

## 코드 컨벤션

- 파일명: kebab-case (예: `instagram-feed.tsx`, `use-emotion-enum.ts`)
- 직접 경로 import (barrel file 최소화)
- Prettier 포맷팅

## 개발 명령어

```bash
pnpm dev --port 3000   # 개발 서버
pnpm build             # 빌드
pnpm test              # Jest 단위 테스트
pnpm test:e2e          # Playwright E2E 테스트
pnpm lint              # ESLint
pnpm format            # Prettier
```

# Claude for Chrome

- Use `read_page` to get element refs from the accessibility tree
- Use `find` to locate elements by description
- Click/interact using `ref`, not coordinates
- NEVER take screenshots unless explicitly requested by the user
