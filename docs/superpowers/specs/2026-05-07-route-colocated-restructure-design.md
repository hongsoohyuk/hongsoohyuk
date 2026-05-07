# Route-Colocated 구조로 src 재편 — 설계 문서

**작성일:** 2026-05-07
**범위:** Bulletproof React `features/` 폐기, Next.js 네이티브 route-colocated 구조로 전환

## 배경

현재 프로젝트는 Bulletproof React 아키텍처를 따라 `src/features/` 하위에 8개 feature(`home`, `resume`, `blog`, `command-line`, `project`, `ai-chat`, `guestbook`, `instagram`)를 두고 있다. 각 feature는 `api/`, `components/`, `hooks/`, `types/`, `utils/`, `config/`, `stores/`, `__tests__/` 등의 하위 폴더로 세분화되어 있다.

규모(전체 ~190 파일, 8개 라우트)에 비해 과분류 문제가 있다:

- 1~2 파일을 위한 폴더가 다수 존재 (`features/resume/api/`, `features/instagram/config/`)
- `features/*/api.ts`(barrel)와 `features/*/api/`(폴더)가 동시에 존재해 import 경로가 일관되지 않음
- `features/guestbook/types/`가 4파일(entities, types, validation, index)로 쪼개져 있음
- `features/guestbook/emotion/`은 feature 안의 sub-feature 형태(5파일)
- `src/lib/turnstile/`이 `ui/lib/config` 자체 하위 분류를 가짐 (lib 안의 mini-feature)
- `/app/`(실제 App Router)과 `/src/app/`(orphan providers + 1줄 shim)이 공존하여 혼란스러움
- 데드 코드 다수: `src/app/providers/{client-providers,query-provider}.tsx`, `app/api/guestbook/route.ts` (POST는 Server Action으로 대체됨, GET은 직접 Supabase 조회), `fetchGuestbook` 함수 (호출처 없음)
- 파일명 컨벤션 혼재: `BlogContent.tsx`(PascalCase), `chat-input.tsx`(kebab-case), `useEmotionEnum.ts`(camelCase) — CLAUDE.md는 kebab-case를 명시함

## 목표

1. `src/`의 폴더 깊이/개수를 줄여 코드 위치 추론 비용 감소
2. Next.js App Router의 `_components`, `_lib` 비공개 폴더 컨벤션을 활용해 라우트가 자기 코드를 소유
3. cross-route로 실제 공유되는 로직만 `src/`에 둬서 shared 영역의 의미를 명확히 함
4. 데드 코드 정리

## 핵심 원칙

1. **`features/` 폴더 폐기.** 라우트가 자기 UI/로직을 소유한다.
2. **라우트 colocate**: 각 라우트는 `_components/`, `_lib/` 두 폴더만 사용한다 (Next.js `_` prefix 비공개 폴더 컨벤션).
3. **cross-route 공유 로직만 `src/`로**: 두 개 이상의 라우트(또는 sitemap, api route)에서 실제로 import되는 데이터 페처/UI/유틸/타입만 src에 둔다.
4. **`_lib/`은 평탄한 카테고리** — hooks/stores/utils/types를 한 폴더에서 관리한다. 같은 종류 파일이 10개 이상 모이면 그때 분할.
5. **`api/` route handler도 동일 규칙** — `app/api/<route>/_lib/`에 보조 로직을 colocate.
6. **파일명 kebab-case 통일** (CLAUDE.md 컨벤션과 정합).

## 라우트 → 콜로케이션 매핑

### 라우트 자체 코드로 이동

| 현재 위치 | 이동 후 |
| --- | --- |
| `features/home/components/HeroTitle.tsx` | `app/[locale]/_components/hero-title.tsx` |
| `features/blog/components/*` | `app/[locale]/(content)/blog/_components/*` (kebab-case) |
| `features/blog/hooks/*`, `utils/*` | `app/[locale]/(content)/blog/_lib/*` |
| `features/project/components/ProjectCard.tsx` | `app/[locale]/(content)/project/_components/project-card.tsx` |
| `features/project/components/Notion*.tsx` (re-export shim) | **삭제** (`@/components/notion` 직접 사용) |
| `features/project/config/constant.ts` | `app/[locale]/(content)/project/_lib/constants.ts` |
| `features/resume/config/constant.ts` | `app/[locale]/(content)/resume/_lib/constants.ts` |
| `features/command-line/components/*` | `app/[locale]/cli/_components/*` |
| `features/command-line/{stores,utils,api,types}/*` | `app/[locale]/cli/_lib/*` (9파일 평탄) |
| `features/ai-chat/components/*`, `stores/*`, `types/*` | `app/[locale]/chat/{_components,_lib}/*` |
| `features/ai-chat/api/*`, `prompts/*` (chat 백엔드) | **`app/api/chat/_lib/*`** (페이지가 import 안 함, route handler 전용) |
| `features/guestbook/components/*` | `app/[locale]/guestbook/_components/*` |
| `features/guestbook/{hooks,types,emotion}/*` | `app/[locale]/guestbook/_lib/*` (emotion은 5파일을 1파일로 통합, types 4파일을 1파일로 통합) |
| `features/guestbook/api/{actions,list-guestbook.server}.ts` | `app/[locale]/guestbook/_lib/*` (`.server.ts`/`'use server'` 식별자 유지) |
| `features/instagram/components/*` | `app/[locale]/instagram/_components/*` |
| `features/instagram/{api,config,types}/*` | `app/[locale]/instagram/_lib/*` |

### cross-route 공유로 `src/lib/content/`에 이주

여러 라우트(또는 sitemap)에서 import되는 데이터 페처:

| 현재 위치 | 이동 후 |
| --- | --- |
| `features/blog/api/{get-blog-list,get-blog-detail}.ts` | `src/lib/content/blog.ts` (cli, sitemap, chat-context, blog 페이지에서 사용) |
| `features/project/api/pages/{get-project-list,get-project-detail,get-notion-page,get-notion-page-property}.ts` | `src/lib/content/project.ts` (cli, sitemap, chat-context, project 페이지에서 사용) |
| `features/project/api/blocks/*` | `src/lib/content/project.ts` 또는 `src/lib/api/notion-blocks.ts`로 합류 |
| `features/resume/api/get-resume-page.ts` | `src/lib/content/resume.ts` (cli, resume 페이지에서 사용) |
| 위 모듈의 도메인 타입 (`features/blog/types`, `features/project/types`, `features/resume`의 ResumePageResponse) | 같은 파일에 colocate 또는 `src/lib/content/types.ts` |

### 데드 코드 제거

- `app/api/guestbook/route.ts` — 1줄 re-export shim, 호출처 없음 (POST는 Server Action `actions.ts`, GET은 서버 컴포넌트의 `list-guestbook.server.ts`가 Supabase 직접 조회)
- `src/app/api-routes/guestbook/route.ts` — 위 shim의 실체, 동일하게 미사용
- `src/features/guestbook/api/get-guestbook.ts` (`fetchGuestbook` 함수) — `/api/guestbook/${id}`를 호출하나 `[id]/route.ts`는 존재하지 않음, 호출처도 없음
- `src/app/providers/client-providers.tsx` — 어디서도 import되지 않음
- `src/app/providers/query-provider.tsx` — 어디서도 import되지 않음
- `@tanstack/react-query` 의존성 — Provider가 마운트되지 않아 미사용
- `src/app/providers/theme-provider.tsx`의 `ThemeProvider` 래퍼 — 미사용 (`useTheme` hook만 1곳에서 사용)
- `features/*/api.ts` barrel 파일들 — `api/` 폴더 평탄화 후 함께 제거

## 최종 디렉토리 구조

### `app/`

```
app/
├── [locale]/
│   ├── layout.tsx                                # next-themes ThemeProvider 직접 사용 (현재 그대로)
│   ├── page.tsx
│   ├── _components/
│   │   └── hero-title.tsx
│   ├── (content)/
│   │   ├── layout.tsx
│   │   ├── blog/
│   │   │   ├── (list)/{page,layout,loading}.tsx
│   │   │   ├── [slug]/{page,layout,loading}.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── _components/
│   │   │   │   ├── blog-content.tsx
│   │   │   │   ├── blog-post-card.tsx
│   │   │   │   ├── blog-search-filter.tsx
│   │   │   │   └── category-badges.tsx
│   │   │   └── _lib/
│   │   │       ├── use-search-filter-params.ts
│   │   │       ├── use-sticky-detection.ts
│   │   │       └── notion-extractors.ts
│   │   ├── project/
│   │   │   ├── [slug]/{page,loading}.tsx
│   │   │   ├── {page,layout,loading}.tsx
│   │   │   ├── _components/project-card.tsx
│   │   │   └── _lib/constants.ts
│   │   └── resume/
│   │       ├── {page,layout,loading}.tsx
│   │       └── _lib/constants.ts
│   ├── chat/
│   │   ├── page.tsx
│   │   ├── _components/
│   │   │   ├── chat-page.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── chat-messages.tsx
│   │   │   ├── chat-error.tsx
│   │   │   └── chat-suggestions.tsx
│   │   └── _lib/
│   │       ├── chat-store.ts
│   │       ├── chat-provider.tsx
│   │       └── types.ts
│   ├── cli/
│   │   ├── {page,layout}.tsx
│   │   ├── _components/
│   │   │   ├── terminal.tsx
│   │   │   ├── donut-animation.tsx
│   │   │   └── vim-editor.tsx
│   │   └── _lib/
│   │       ├── terminal-store.ts
│   │       ├── terminal-provider.tsx
│   │       ├── commands.ts
│   │       ├── executor.ts
│   │       ├── filesystem.ts
│   │       ├── lexer.ts
│   │       ├── parser.ts
│   │       ├── build-cli-data.ts
│   │       └── types.ts
│   ├── guestbook/
│   │   ├── {page,layout,loading}.tsx
│   │   ├── _components/
│   │   │   ├── guestbook-list.tsx
│   │   │   ├── guestbook-widget.tsx
│   │   │   ├── guestbook-skeleton.tsx
│   │   │   ├── guestbook-form-dialog.tsx
│   │   │   ├── guestbook-detail-dialog.tsx
│   │   │   ├── emotion-button.tsx
│   │   │   ├── emotion-button-group.tsx
│   │   │   └── emotion-badges.tsx
│   │   └── _lib/
│   │       ├── emotion.ts                        # constant + type + option + validation 통합
│   │       ├── use-emotion-enum.ts
│   │       ├── use-field-error.ts
│   │       ├── use-turnstile-validation.ts
│   │       ├── list-guestbook.server.ts
│   │       ├── actions.ts                        # 'use server'
│   │       └── types.ts                          # entities + dto + validation 통합
│   └── instagram/
│       ├── {page,layout,loading,error}.tsx
│       ├── _components/
│       │   ├── feed-item.tsx
│       │   ├── feed-stats.tsx
│       │   ├── instagram-feed.tsx
│       │   ├── post-comments.tsx
│       │   ├── post-media-viewer.tsx
│       │   ├── profile-card.tsx
│       │   └── profile-stats.tsx
│       └── _lib/
│           ├── get-post.ts
│           ├── get-profile.ts
│           ├── list-post.ts
│           ├── local.ts
│           ├── query-key-factory.ts
│           ├── constants.ts
│           └── types.ts
├── api/
│   ├── chat/
│   │   ├── route.ts
│   │   └── _lib/
│   │       ├── build-prompt.ts
│   │       ├── fetch-context.ts
│   │       └── prompts/                          # 기존 features/ai-chat/prompts/ 통째 이동
│   ├── revalidate/blog/route.ts
│   └── spotify/{authorize,callback}/route.ts
├── sitemap.ts                                    # @/lib/content/{blog,project} import
├── robots.ts
└── globals.css
```

### `src/`

```
src/
├── components/
│   ├── ui/                                       # shadcn primitives (변경 없음)
│   ├── layout/                                   # header, footer, header-nav, webview-shell
│   ├── notion/                                   # Notion 렌더 (blog/project/resume 공유)
│   │   ├── notion-blocks.tsx
│   │   ├── notion-rich-text.tsx
│   │   ├── blocks/                               # 유지 (15개 block 컴포넌트)
│   │   ├── utils/rich-text-utils.ts
│   │   └── index.ts
│   └── mdx-components.tsx                        # mdx/ 폴더 평탄화
├── hooks/
│   ├── use-intersection-observer.ts
│   ├── use-dark-mode.ts
│   ├── use-dom-ready.ts
│   ├── use-dialog-controller.ts                  # useDialogController.ts → kebab-case
│   └── use-theme.ts                              # src/app/providers/theme-provider.tsx의 useTheme 추출
├── lib/
│   ├── api/                                      # http, notion, notion-blocks, pagination, supabase, spotify, chat-log
│   ├── content/                                  # cross-route 데이터 + 도메인 타입
│   │   ├── blog.ts
│   │   ├── project.ts
│   │   └── resume.ts
│   ├── i18n/
│   ├── security/
│   ├── turnstile/                                # ui/lib/config 중첩 제거, 평탄화
│   │   ├── turnstile.tsx
│   │   ├── use-turnstile.ts
│   │   ├── verify.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── webview/
│   ├── markdown.ts
│   └── rate-limit.ts
├── config/                                       # fonts, site, layout, metadata, index
├── types/                                        # notion.ts, spotify.d.ts, form.ts (진짜 공유 타입만)
└── utils/                                        # date.ts, number.ts, style.ts (generic helpers, 유지)
```

**삭제되는 디렉토리:**

- `src/app/` 전체 (providers + api-routes + README)
- `src/features/` 전체
- `src/components/mdx/` (1파일 평탄화)
- `src/lib/turnstile/{ui,lib,config}/` 중첩 폴더

## 설정/문서 업데이트

### `tsconfig.json`

```json
"paths": {
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/config/*": ["./src/config/*"],
  "@/types/*": ["./src/types/*"],
  "@/utils/*": ["./src/utils/*"]
}
```

`@/features/*` 항목 제거. 나머지는 유지.

### `package.json`

`@tanstack/react-query` 제거.

### `CLAUDE.md`

- "Bulletproof React 구조" / "Feature 폴더 구조" / "의존성 규칙" / "App Router 연결" 섹션을 "Route-Colocated 구조"로 교체
- 새 의존성 규칙: 라우트(`app/`) → src 단방향, src 내부에서 라우트로 import 금지, src 내 lib는 components/hooks/utils 등으로부터 import 안 함 (역방향 금지)
- 기술 스택에서 TanStack React Query 제거
- App Router 연결 예시 갱신: `export {InstagramPage as default} from '@/features/instagram'` → 페이지 파일이 직접 `_components/instagram-page.tsx`를 렌더

### `MEMORY.md` (auto memory)

- "Bulletproof React 아키텍처: features → features import 금지, app → features 허용" 라인 제거 또는 새 규칙으로 교체
- "feature 간 데이터 집계는 app layer에서 수행 → features는 순수 변환 함수만 export" 라인 제거

### 테스트 위치

- `src/features/*/__tests__/` → 같은 라우트의 `_lib/__tests__/` 또는 `_components/__tests__/`로 이동
- `src/lib/*/__tests__/`는 그대로 유지

## 마이그레이션 순서

각 단계는 독립 커밋으로 진행, 각 단계 후 `pnpm build && pnpm test` 통과 확인.

1. **데드 코드 제거**
   - `app/api/guestbook/`, `src/app/api-routes/guestbook/` 삭제
   - `src/features/guestbook/api/get-guestbook.ts` + `fetchGuestbook` export 제거
   - `src/app/providers/client-providers.tsx`, `query-provider.tsx` 삭제
   - `@tanstack/react-query` 패키지 제거 (`pnpm remove @tanstack/react-query`)

2. **공유 모듈 먼저 이주 (`src/lib/content/`)**
   - `features/{blog,project,resume}/api/*` → `src/lib/content/{blog,project,resume}.ts`
   - 도메인 타입 colocate
   - 사용처 import 업데이트 (cli, sitemap, chat-context, content 라우트들)

3. **라우트별 colocate** (영향 범위 좁은 순서)
   - 3a. home (1 파일)
   - 3b. resume
   - 3c. instagram
   - 3d. project (NotionBlocks shim 제거)
   - 3e. blog
   - 3f. cli
   - 3g. chat (페이지 vs api 백엔드 분리)
   - 3h. guestbook (emotion + types 통합)

4. **나머지 정리**
   - `src/features/` 디렉토리 삭제
   - `src/app/providers/theme-provider.tsx`의 `useTheme` → `src/hooks/use-theme.ts` 이주, `src/app/` 삭제
   - `src/components/mdx/` 평탄화
   - `src/lib/turnstile/` 내부 평탄화
   - `tsconfig.json` paths 정리
   - `CLAUDE.md`, `MEMORY.md` 업데이트

5. **파일명 kebab-case 정규화** — `git mv`로 추적 유지
   - PascalCase 컴포넌트 파일들 (`Terminal.tsx` → `terminal.tsx` 등)
   - camelCase util/hook 파일들 (`useEmotionEnum.ts` → `use-emotion-enum.ts` 등)

6. **검증**
   - `pnpm build` 통과
   - `pnpm test` 통과
   - `pnpm test:e2e` 통과 (Playwright)
   - `pnpm lint` 통과
   - 주요 라우트 수동 smoke (홈, 블로그, 프로젝트, CLI, 챗, 게스트북, 인스타그램)

## 위험 요소 및 완화

| 위험 | 완화 방법 |
| --- | --- |
| import 경로 변경 누락 | 단계별 커밋 + 빌드/테스트 게이트, ESLint와 TS 컴파일러로 자동 검출 |
| 파일명 대소문자 변경 시 git 추적 깨짐 (case-insensitive 파일시스템) | `git mv`로 명시적 rename |
| `'use server'` / `.server.ts` 식별자 유실로 server-only 코드가 client에 번들될 위험 | 파일 이동 시 식별자/디렉티브 보존 확인 |
| Vercel Cron의 `/api/revalidate/blog` 경로는 변경 불가 | 해당 라우트는 위치 그대로 유지 |
| 빌드 캐시(`.next/`, `tsbuildinfo`)에 옛 경로가 남아 빌드 실패 | 단계 후 `rm -rf .next` 후 재빌드 |

## 범위 외

- ESLint import order 룰 갱신 (Bulletproof 전용 룰 제거)은 후속 PR로 분리 가능 — 본 작업에서는 룰을 끄고 import order는 유지
- React Query 제거 후 데이터 페칭 패턴 재설계는 본 작업 범위 외 (현재 RSC + Server Action으로 충분)
- 컴포넌트 자체 리팩터링/추상화 변경은 다루지 않음
