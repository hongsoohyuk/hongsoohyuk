# Route-Colocated Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/features/`를 폐기하고 Next.js `_components`/`_lib` route-colocated 구조로 전환하여 폴더 깊이를 줄이고 데드 코드를 제거한다.

**Architecture:** 라우트가 자기 UI/로직을 소유한다. cross-route 공유 데이터 페처는 `src/lib/content/`로 추출. 보조 로직은 `_lib/`(라우트별) 또는 `app/api/<route>/_lib/`(API 라우트별)에 colocate. `_components/` + `_lib/` 두 폴더만 사용 (10+ 동종 파일이 모이면 그때 분할). 파일명은 kebab-case로 통일.

**Tech Stack:** Next.js 16.1, React 19, TypeScript, Jest, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-05-07-route-colocated-restructure-design.md`

---

## 사전 안내

- **각 Phase는 독립 커밋**. Phase 안의 task 단위로도 가능한 한 커밋.
- **검증 게이트**:
  - micro: `pnpm tsc --noEmit` (타입 체크)
  - phase: `pnpm test` (Jest 단위 테스트) + `pnpm lint`
  - 최종: `pnpm build` + `pnpm test:e2e`
- **`.next/` 캐시**: 큰 구조 변경 후 `rm -rf .next` 1회 실행.
- **파일 이동은 항상 `git mv`** (대소문자만 바뀌는 rename도 `git mv`로 명시).
- **import 경로 업데이트**: 파일을 옮긴 직후, 모든 importer를 grep으로 찾고 Edit으로 갱신. 이동·갱신·타입체크가 한 task의 하나의 unit.

---

## Phase 0: 베이스라인 확보

### Task 0.1: 베이스라인 빌드/테스트 통과 확인

**Files:** 없음 (검증만)

- [ ] **Step 1: 의존성 설치 상태 확인**

```bash
pnpm install
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 단위 테스트**

```bash
pnpm test
```

Expected: 모든 테스트 통과.

- [ ] **Step 4: 린트**

```bash
pnpm lint
```

Expected: 에러 없음 (warning은 무시).

이 베이스라인이 깨져있으면 우선 수정 후 진행.

---

## Phase 1: 데드 코드 제거

규모를 줄여서 후속 작업의 영향 범위를 좁힌다.

### Task 1.1: 미사용 guestbook API route 제거

**Files:**
- Delete: `app/api/guestbook/route.ts`
- Delete: `src/app/api-routes/guestbook/route.ts`
- Delete: `src/app/api-routes/` (빈 폴더)

**Why:** `app/api/guestbook/route.ts`는 `src/app/api-routes/guestbook/route.ts`를 1줄 re-export하는 shim. 페이지의 POST는 Server Action(`actions.ts`), GET은 서버 컴포넌트의 `list-guestbook.server.ts`가 Supabase 직접 조회로 처리하므로 어디서도 호출되지 않음.

- [ ] **Step 1: 호출처 없음 재확인**

```bash
grep -rn "fetch.*'/api/guestbook'\|fetch.*\"/api/guestbook\"\|fetch(\`/api/guestbook\`" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Expected: 빈 결과 (호출 없음).

- [ ] **Step 2: 파일 삭제**

```bash
git rm app/api/guestbook/route.ts
git rm src/app/api-routes/guestbook/route.ts
rmdir src/app/api-routes/guestbook src/app/api-routes
rmdir app/api/guestbook
```

- [ ] **Step 3: 검증**

```bash
pnpm tsc --noEmit && pnpm test
```

Expected: 통과.

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: remove unused /api/guestbook handlers (replaced by Server Actions + direct Supabase)"
```

### Task 1.2: 미사용 `fetchGuestbook` 클라이언트 함수 제거

**Files:**
- Delete: `src/features/guestbook/api/get-guestbook.ts`
- Modify: `src/features/guestbook/api.ts`
- Modify: `src/features/guestbook/index.ts` (만약 export 시)

**Why:** `fetchGuestbook`은 `/api/guestbook/${id}`를 호출하지만 `[id]/route.ts`는 존재하지 않고, 호출처도 없음.

- [ ] **Step 1: 호출처 재확인**

```bash
grep -rn "fetchGuestbook\b" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "fetchGuestbookListServer\|fetchAllGuestbookEntries\|fetchGuestbookEntry"
```

Expected: 정의/export 라인만 (호출 없음).

- [ ] **Step 2: `src/features/guestbook/api/get-guestbook.ts` 삭제**

```bash
git rm src/features/guestbook/api/get-guestbook.ts
```

- [ ] **Step 3: `src/features/guestbook/api.ts` 갱신**

`export {fetchGuestbook} from './api/get-guestbook';` 라인 제거.

- [ ] **Step 4: `src/features/guestbook/index.ts`도 동일 라인 제거 (있는 경우)**

```bash
grep -n "fetchGuestbook\b" src/features/guestbook/index.ts
```

검색되면 제거.

- [ ] **Step 5: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "chore: remove unused fetchGuestbook client helper"
```

### Task 1.3: 미사용 ClientProviders / QueryProvider 제거

**Files:**
- Delete: `src/app/providers/client-providers.tsx`
- Delete: `src/app/providers/query-provider.tsx`

**Why:** layout.tsx가 `next-themes`의 ThemeProvider를 직접 쓰므로 `ClientProviders`는 미사용. `QueryProvider`도 마운트되지 않아 미사용.

- [ ] **Step 1: 외부 import 재확인**

```bash
grep -rn "ClientProviders\|client-providers\|QueryProvider\|query-provider\b" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Expected: 정의 파일과 `client-providers.tsx` 내부 import만.

- [ ] **Step 2: 파일 삭제**

```bash
git rm src/app/providers/client-providers.tsx
git rm src/app/providers/query-provider.tsx
```

- [ ] **Step 3: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "chore: remove orphan ClientProviders/QueryProvider"
```

### Task 1.4: `@tanstack/react-query` 의존성 제거

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (자동 업데이트)

**Why:** Provider 미마운트로 React Query 훅이 실행되지 않으므로 의존성 자체 제거.

- [ ] **Step 1: 사용처 재확인**

```bash
grep -rn "@tanstack/react-query\|useQuery\|useMutation\|useInfiniteQuery\|QueryClient" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Expected: 빈 결과.

- [ ] **Step 2: 의존성 제거**

```bash
pnpm remove @tanstack/react-query
```

- [ ] **Step 3: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add package.json pnpm-lock.yaml
git commit -m "chore: drop unused @tanstack/react-query dependency"
```

### Task 1.5: instagram의 `queryKeyFactory` 제거

**Files:**
- Delete: `src/features/instagram/api/queryKeyFactory.ts`
- Delete: `src/features/instagram/__tests__/query-key-factory.test.ts`

**Why:** React Query 키 생성기. React Query 제거로 사용처 없음 (테스트 파일에서만 import).

- [ ] **Step 1: 사용처 재확인**

```bash
grep -rn "queryKeyFactory\b" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Expected: 정의와 테스트만.

- [ ] **Step 2: 파일 삭제 + 검증 + 커밋**

```bash
git rm src/features/instagram/api/queryKeyFactory.ts
git rm src/features/instagram/__tests__/query-key-factory.test.ts
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "chore: remove instagram queryKeyFactory (unused after React Query removal)"
```

---

## Phase 2: cross-route 공유 모듈을 `src/lib/content/`로 추출

`features/{blog,project,resume}/api/*`는 cli, sitemap, chat 컨텍스트, 본인 라우트 등 여러 곳에서 import됨. `src/lib/content/`로 우선 이주하여 후속 라우트별 작업의 영향 범위를 줄인다.

### Task 2.1: `src/lib/content/` 디렉토리 구조 생성 + blog 이주

**Files:**
- Create: `src/lib/content/blog.ts` — `getBlogList`, `getBlogDetail` + 관련 타입을 한 파일에 통합
- Modify: 기존 importers (아래 Step에서 enumerate)
- Move tests: `src/features/blog/__tests__/get-blog-{list,detail}.test.ts` → `src/lib/content/__tests__/blog.test.ts` (또는 분리 유지)

**현재 위치:**
- `src/features/blog/api/get-blog-list.ts` (`getBlogList`)
- `src/features/blog/api/get-blog-detail.ts` (`getBlogDetail`)
- `src/features/blog/types/index.ts` (도메인 타입)
- `src/features/blog/api.ts` (barrel)

**현재 importers** (grep 기반):

```
app/[locale]/(content)/blog/(list)/page.tsx       (BlogContent, BlogSearchFilter, getBlogList)
app/[locale]/(content)/blog/[slug]/page.tsx       (CategoryBadges, getBlogDetail, getBlogList)
app/[locale]/(content)/blog/(list)/loading.tsx    (BlogSearchFilter)
app/[locale]/cli/page.tsx                         (getBlogList)
app/sitemap.ts                                    (getBlogList)
src/features/ai-chat/api/fetch-context.ts         (getBlogList)
src/features/blog/components/*                    (도메인 타입)
```

- [ ] **Step 1: blog 타입과 API 파일 내용 검토**

```bash
cat src/features/blog/api/get-blog-list.ts src/features/blog/api/get-blog-detail.ts src/features/blog/types/index.ts
```

- [ ] **Step 2: `src/lib/content/blog.ts` 작성**

`get-blog-list.ts` + `get-blog-detail.ts`의 함수 본체와 `types/index.ts`의 도메인 타입을 한 파일로 통합한다.

```bash
mkdir -p src/lib/content
```

`src/lib/content/blog.ts`에 다음 구조로 작성:

```typescript
// 1. import 블록 (외부 + @/lib/api)
// 2. 타입 (BlogItem, BlogListResponse, BlogDetail 등 — 기존 types/index.ts에서)
// 3. getBlogList 본체 (기존 get-blog-list.ts에서)
// 4. getBlogDetail 본체 (기존 get-blog-detail.ts에서)
```

내부 import에서 `'../types'` 같은 상대 경로가 있으면 같은 파일 내 직접 참조로 변경.

- [ ] **Step 3: 새 파일 타입체크**

```bash
pnpm tsc --noEmit
```

Expected: 통과 (아직 importers는 기존 경로를 사용).

- [ ] **Step 4: importer 일괄 업데이트**

다음 파일들의 import를 `'@/lib/content/blog'`로 변경:

```
app/[locale]/(content)/blog/(list)/page.tsx
app/[locale]/(content)/blog/[slug]/page.tsx
app/[locale]/cli/page.tsx
app/sitemap.ts
src/features/ai-chat/api/fetch-context.ts
src/features/blog/components/BlogContent.tsx
src/features/blog/components/BlogPostCard.tsx
src/features/blog/components/BlogSearchFilter.tsx
src/features/blog/components/CategoryBadges.tsx
src/features/blog/utils/notion-extractors.ts
```

각 파일에서:
- `from '@/features/blog/api'` → `from '@/lib/content/blog'`
- `from '@/features/blog/api/get-blog-list'` → `from '@/lib/content/blog'`
- `from '@/features/blog/api/get-blog-detail'` → `from '@/lib/content/blog'`
- `from '@/features/blog/types'` → `from '@/lib/content/blog'`
- `from '@/features/blog'` (barrel)에서 가져오던 타입은 유지하거나 `@/lib/content/blog`로 이동
  - 단, components(`BlogContent`, `BlogSearchFilter` 등)는 본 task에서 그대로 둠 (Phase 3에서 이동)

검증 grep:

```bash
grep -rn "from '@/features/blog/api\|from '@/features/blog/types" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 5: blog의 기존 api/types 파일 정리**

```bash
git rm src/features/blog/api.ts
git rm src/features/blog/api/get-blog-list.ts
git rm src/features/blog/api/get-blog-detail.ts
rmdir src/features/blog/api
git rm src/features/blog/types/index.ts
rmdir src/features/blog/types
```

- [ ] **Step 6: blog 테스트 이주**

```bash
mkdir -p src/lib/content/__tests__
git mv src/features/blog/__tests__/get-blog-list.test.ts src/lib/content/__tests__/get-blog-list.test.ts
git mv src/features/blog/__tests__/get-blog-detail.test.ts src/lib/content/__tests__/get-blog-detail.test.ts
```

이주된 테스트의 import 경로를 `'../../features/blog/api/get-blog-list'` 류 → `'../blog'`로 갱신:

```bash
grep -n "from '\.\." src/lib/content/__tests__/*.test.ts
```

각 매치를 `from '../blog'`로 Edit.

- [ ] **Step 7: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test src/lib/content
git add -A
git commit -m "refactor: extract blog data fetchers to src/lib/content/blog"
```

### Task 2.2: project 데이터 페처 이주

**Files:**
- Create: `src/lib/content/project.ts` — `getProjectList`, `getProjectDetail`, `getNotionPage`, `getNotionPageProperty` + 도메인 타입을 한 파일에 통합
- Note: `getNotionBlock`, `getNotionBlockChildren`, `getNotionBlockChildrenRecursive`는 이미 `src/lib/api/notion-blocks.ts`에 있고 project의 `api/blocks/*.ts`는 단순 re-export임 → block 함수는 `src/lib/content/project.ts`에 포함하지 않고, 직접 `@/lib/api/notion-blocks`에서 가져오도록 변경

**현재 importers:**

```
app/[locale]/(content)/project/page.tsx           (ProjectCard, getProjectList)
app/[locale]/(content)/project/[slug]/page.tsx    (getProjectDetail, getProjectList)
app/[locale]/cli/page.tsx                         (getProjectList)
app/sitemap.ts                                    (getProjectList)
src/features/ai-chat/api/fetch-context.ts         (getProjectList)
src/features/project/components/*                 (NotionBlocks, ProjectCard, NotionRichText)
```

- [ ] **Step 1: 파일 내용 검토**

```bash
cat src/features/project/api/pages/get-project-list.ts \
    src/features/project/api/pages/get-project-detail.ts \
    src/features/project/api/pages/get-notion-page.ts \
    src/features/project/api/pages/get-notion-page-property.ts \
    src/features/project/api/blocks/get-block.ts \
    src/features/project/api/blocks/get-block-children.ts \
    src/features/project/types/index.ts \
    src/features/project/api.ts
```

- [ ] **Step 2: `src/lib/content/project.ts` 작성**

다음을 한 파일에 통합:
- 도메인 타입 (ProjectItem, ProjectDetail 등 — `types/index.ts`에서)
- `getProjectList`, `getProjectDetail`
- `getNotionPage`, `getNotionPageProperty`

block 함수들(`getNotionBlock` 등)은 포함하지 않음 — `@/lib/api/notion-blocks`에서 직접 사용.

- [ ] **Step 3: project block re-export 사용처 업데이트**

```bash
grep -rn "from '@/features/project/api/blocks\|from '@/features/project/api'" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -i "block\|getNotionBlock"
```

매치된 파일에서:
- `from '@/features/project/api'` 또는 `from '@/features/project/api/blocks/...'`로 가져오던 `getNotionBlock`, `getNotionBlockChildren`, `getNotionBlockChildrenRecursive`를 `from '@/lib/api/notion-blocks'`로 변경

- [ ] **Step 4: 그 외 project page 함수 importer 업데이트**

```
app/[locale]/(content)/project/page.tsx
app/[locale]/(content)/project/[slug]/page.tsx
app/[locale]/cli/page.tsx
app/sitemap.ts
src/features/ai-chat/api/fetch-context.ts
src/features/project/components/ProjectCard.tsx (도메인 타입)
```

각 파일에서:
- `from '@/features/project/api'` → `from '@/lib/content/project'`
- `from '@/features/project/api/pages/...'` → `from '@/lib/content/project'`
- `from '@/features/project/types'` → `from '@/lib/content/project'`

검증:

```bash
grep -rn "from '@/features/project/api\|from '@/features/project/types" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 5: 기존 project api/types 폴더 삭제**

```bash
git rm -r src/features/project/api/
git rm src/features/project/api.ts
git rm -r src/features/project/types/
```

- [ ] **Step 6: 테스트 이주**

```bash
git mv src/features/project/__tests__/get-project-list.test.ts src/lib/content/__tests__/get-project-list.test.ts
git mv src/features/project/__tests__/get-project-detail.test.ts src/lib/content/__tests__/get-project-detail.test.ts
```

import 경로 갱신: `from '../api/pages/get-project-list'` → `from '../project'`.

- [ ] **Step 7: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test src/lib/content
git add -A
git commit -m "refactor: extract project data fetchers to src/lib/content/project"
```

### Task 2.3: resume 데이터 페처 이주

**Files:**
- Create: `src/lib/content/resume.ts` — `getResumePage` + `ResumePageResponse` 타입

**현재 importers:**

```
app/[locale]/(content)/resume/page.tsx
app/[locale]/cli/page.tsx
src/features/resume/api.ts (barrel)
src/features/resume/index.ts (barrel)
```

- [ ] **Step 1: 파일 내용 검토**

```bash
cat src/features/resume/api/get-resume-page.ts src/features/resume/api.ts src/features/resume/index.ts
```

- [ ] **Step 2: `src/lib/content/resume.ts` 작성**

`get-resume-page.ts`의 함수 + `ResumePageResponse` 타입 통합.

- [ ] **Step 3: importer 업데이트**

```
app/[locale]/(content)/resume/page.tsx
app/[locale]/cli/page.tsx
```

각 파일에서:
- `from '@/features/resume/api'` → `from '@/lib/content/resume'`
- `from '@/features/resume'` (`ResumePageResponse` 타입)에서의 import는 `from '@/lib/content/resume'`로 변경

검증:

```bash
grep -rn "from '@/features/resume/api\|from '@/features/resume'" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과 (또는 features/resume의 잔존 파일 — Phase 3.b에서 처리).

- [ ] **Step 4: 기존 resume api 파일 정리**

```bash
git rm src/features/resume/api.ts
git rm src/features/resume/api/get-resume-page.ts
rmdir src/features/resume/api
```

`src/features/resume/index.ts`에서 ResumePageResponse 관련 export 제거 (config는 Phase 3.b에서 처리 — 그때까지 잠시 유지 가능).

- [ ] **Step 5: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor: extract resume data fetcher to src/lib/content/resume"
```

---

## Phase 3: 라우트별 콜로케이션

영향 범위가 좁은 라우트부터 순차 진행.

### Task 3.1: home 라우트

**Files:**
- Move: `src/features/home/components/HeroTitle.tsx` → `app/[locale]/_components/hero-title.tsx`
- Modify: `app/[locale]/page.tsx`
- Delete: `src/features/home/` (전체)

**현재 importer:** `app/[locale]/page.tsx` (`HeroTitle`)

- [ ] **Step 1: 폴더 생성 + 파일 이동 (kebab-case 적용)**

```bash
mkdir -p app/[locale]/_components
git mv src/features/home/components/HeroTitle.tsx "app/[locale]/_components/hero-title.tsx"
```

- [ ] **Step 2: `app/[locale]/page.tsx` import 갱신**

`from '@/features/home'` → `from './_components/hero-title'` (또는 `from '@/app/[locale]/_components/hero-title'` — 대부분 상대 경로 권장).

- [ ] **Step 3: features/home 잔여 파일 삭제**

```bash
git rm src/features/home/index.ts
rmdir src/features/home/components src/features/home
```

- [ ] **Step 4: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(home): colocate HeroTitle into [locale]/_components"
```

### Task 3.2: resume 라우트

**Files:**
- Move: `src/features/resume/config/constant.ts` → `app/[locale]/(content)/resume/_lib/constants.ts`
- Delete: `src/features/resume/` (전체)

**현재 importer:** `src/features/resume/index.ts` (barrel만), 그 외 직접 import는 grep으로 확인

- [ ] **Step 1: constant 사용처 확인**

```bash
grep -rn "from '@/features/resume/config\|from '@/features/resume'" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

매치된 파일을 모두 적어둔다. 직접 사용이 없고 barrel만 있다면 단순히 폴더 이동 후 barrel만 정리.

- [ ] **Step 2: constants 이동**

```bash
mkdir -p "app/[locale]/(content)/resume/_lib"
git mv src/features/resume/config/constant.ts "app/[locale]/(content)/resume/_lib/constants.ts"
```

- [ ] **Step 3: 사용처 import 갱신**

`from '@/features/resume/config/constant'` 또는 `from '@/features/resume'` 의 constant 부분 → `from './_lib/constants'` (resume 라우트 내) 또는 절대 경로 `@/...`.

- [ ] **Step 4: 잔여 파일 삭제**

```bash
git rm src/features/resume/index.ts
rmdir src/features/resume/config src/features/resume
```

- [ ] **Step 5: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(resume): colocate constants into route _lib"
```

### Task 3.3: instagram 라우트

**Files:**
- Move 컴포넌트: `src/features/instagram/components/*.tsx` → `app/[locale]/instagram/_components/*.tsx` (kebab-case 적용)
- Move api: `src/features/instagram/api/{get-post,get-profile,list-post,local}.ts` → `app/[locale]/instagram/_lib/`
- Move types: `src/features/instagram/types/index.ts` → `app/[locale]/instagram/_lib/types.ts`
- Move config: `src/features/instagram/config/constant.ts` → `app/[locale]/instagram/_lib/constants.ts`
- Move tests: `src/features/instagram/__tests__/{get-profile,list-post,local}.test.ts` → `app/[locale]/instagram/_lib/__tests__/`
- Delete: `src/features/instagram/` (전체)

**현재 외부 importers:** `app/[locale]/instagram/{page,loading}.tsx` 만.

- [ ] **Step 1: 폴더 생성**

```bash
mkdir -p "app/[locale]/instagram/_components"
mkdir -p "app/[locale]/instagram/_lib/__tests__"
```

- [ ] **Step 2: 컴포넌트 이동 (kebab-case)**

```bash
git mv src/features/instagram/components/FeedItem.tsx "app/[locale]/instagram/_components/feed-item.tsx"
git mv src/features/instagram/components/FeedStats.tsx "app/[locale]/instagram/_components/feed-stats.tsx"
git mv src/features/instagram/components/InstagramFeed.tsx "app/[locale]/instagram/_components/instagram-feed.tsx"
git mv src/features/instagram/components/PostComments.tsx "app/[locale]/instagram/_components/post-comments.tsx"
git mv src/features/instagram/components/PostMediaViewer.tsx "app/[locale]/instagram/_components/post-media-viewer.tsx"
git mv src/features/instagram/components/ProfileCard.tsx "app/[locale]/instagram/_components/profile-card.tsx"
git mv src/features/instagram/components/ProfileStats.tsx "app/[locale]/instagram/_components/profile-stats.tsx"
```

- [ ] **Step 3: api/types/config 이동**

```bash
git mv src/features/instagram/api/get-post.ts "app/[locale]/instagram/_lib/get-post.ts"
git mv src/features/instagram/api/get-profile.ts "app/[locale]/instagram/_lib/get-profile.ts"
git mv src/features/instagram/api/list-post.ts "app/[locale]/instagram/_lib/list-post.ts"
git mv src/features/instagram/api/local.ts "app/[locale]/instagram/_lib/local.ts"
git mv src/features/instagram/types/index.ts "app/[locale]/instagram/_lib/types.ts"
git mv src/features/instagram/config/constant.ts "app/[locale]/instagram/_lib/constants.ts"
```

- [ ] **Step 4: 테스트 이동**

```bash
git mv src/features/instagram/__tests__/get-profile.test.ts "app/[locale]/instagram/_lib/__tests__/get-profile.test.ts"
git mv src/features/instagram/__tests__/list-post.test.ts "app/[locale]/instagram/_lib/__tests__/list-post.test.ts"
git mv src/features/instagram/__tests__/local.test.ts "app/[locale]/instagram/_lib/__tests__/local.test.ts"
```

- [ ] **Step 5: 이동된 파일 내부의 상대 import 갱신**

이동된 파일에서 `'../types'`, `'../api/...'`, `'../components/...'` 같은 상대 경로가 깨졌을 수 있다. 다음 grep으로 확인:

```bash
grep -rn "from '\.\." "app/[locale]/instagram/_components" "app/[locale]/instagram/_lib"
```

각 매치를 새 위치 기준의 상대 경로(`'./types'`, `'./local'` 등) 또는 절대 경로(`@/lib/...`)로 갱신.

- [ ] **Step 6: 외부 importer 업데이트**

`app/[locale]/instagram/page.tsx`:
- `from '@/features/instagram/api'` → `from './_lib/get-profile'` 등 직접 경로 (`getInstagramProfile`, `getInstagramPostList`)
- `from '@/features/instagram'` → `from './_components/instagram-feed'`, `from './_components/profile-card'` 등 직접 경로

`app/[locale]/instagram/loading.tsx`:
- `from '@/features/instagram'` (`ProfileStatsSkeleton`) → `from './_components/profile-stats'`

검증:

```bash
grep -rn "from '@/features/instagram" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 7: features/instagram 잔여 정리**

```bash
git rm src/features/instagram/api.ts
git rm src/features/instagram/index.ts
rmdir src/features/instagram/api src/features/instagram/components src/features/instagram/config src/features/instagram/types src/features/instagram/__tests__ src/features/instagram
```

- [ ] **Step 8: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(instagram): colocate route into _components/_lib"
```

### Task 3.4: project 라우트

**Files:**
- Move: `src/features/project/components/{NotionBlocks,NotionRichText}.tsx` → **삭제** (re-export shim)
- Move: `src/features/project/components/ProjectCard.tsx` → `app/[locale]/(content)/project/_components/project-card.tsx`
- Move: `src/features/project/config/constant.ts` → `app/[locale]/(content)/project/_lib/constants.ts`
- Move test: `src/features/project/__tests__/ProjectCard.test.tsx` → `app/[locale]/(content)/project/_components/__tests__/project-card.test.tsx`
- Delete: `src/features/project/__tests__/{NotionBlocks,NotionRichText}.test.tsx` — `src/components/notion/`에 이미 동일 컴포넌트 존재. 테스트 위치는 `src/components/notion/__tests__/`로 검토 (별도 task로 처리하거나 이번에 이동)

**Note:** `features/project/components/NotionBlocks.tsx`와 `NotionRichText.tsx`는 `@/components/notion`에서 re-export하는 1줄 shim → 삭제만 하고 사용처를 `@/components/notion`으로 변경.

- [ ] **Step 1: shim 사용처 확인 및 직접 변경**

```bash
grep -rn "from '@/features/project/components/Notion" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
grep -rn "from '@/features/project/components'" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

매치된 import를 `from '@/components/notion'`으로 변경.

- [ ] **Step 2: shim 삭제**

```bash
git rm src/features/project/components/NotionBlocks.tsx
git rm src/features/project/components/NotionRichText.tsx
```

- [ ] **Step 3: ProjectCard 이동**

```bash
mkdir -p "app/[locale]/(content)/project/_components/__tests__"
mkdir -p "app/[locale]/(content)/project/_lib"
git mv src/features/project/components/ProjectCard.tsx "app/[locale]/(content)/project/_components/project-card.tsx"
git mv src/features/project/__tests__/ProjectCard.test.tsx "app/[locale]/(content)/project/_components/__tests__/project-card.test.tsx"
git mv src/features/project/config/constant.ts "app/[locale]/(content)/project/_lib/constants.ts"
```

- [ ] **Step 4: NotionBlocks/NotionRichText 테스트 이동**

```bash
mkdir -p src/components/notion/__tests__
git mv src/features/project/__tests__/NotionBlocks.test.tsx src/components/notion/__tests__/notion-blocks.test.tsx
git mv src/features/project/__tests__/NotionRichText.test.tsx src/components/notion/__tests__/notion-rich-text.test.tsx
```

- [ ] **Step 5: 이동된 테스트의 import 갱신**

```bash
grep -n "from '\.\." "app/[locale]/(content)/project/_components/__tests__/project-card.test.tsx" src/components/notion/__tests__/*.test.tsx
```

각 매치를 새 경로로 변경 (project-card 테스트는 `'../project-card'`, notion 테스트는 `'../notion-blocks'`, `'../notion-rich-text'`).

- [ ] **Step 6: ProjectCard 외부 importer 업데이트**

```bash
grep -rn "from '@/features/project'" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

매치된 파일에서 `ProjectCard` import를 `from './_components/project-card'` 또는 절대 경로로 변경.

검증:

```bash
grep -rn "from '@/features/project" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 7: features/project 잔여 정리**

```bash
git rm src/features/project/index.ts
rmdir src/features/project/components src/features/project/config src/features/project/__tests__ src/features/project
```

- [ ] **Step 8: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(project): colocate route, drop Notion re-export shims"
```

### Task 3.5: blog 라우트

**Files:**
- Move 컴포넌트: `src/features/blog/components/*.tsx` → `app/[locale]/(content)/blog/_components/*.tsx` (kebab-case)
- Move hooks: `src/features/blog/hooks/*.ts` → `app/[locale]/(content)/blog/_lib/*.ts`
- Move utils: `src/features/blog/utils/notion-extractors.ts` → `app/[locale]/(content)/blog/_lib/notion-extractors.ts`
- Delete: `src/features/blog/` (전체)

- [ ] **Step 1: 폴더 생성**

```bash
mkdir -p "app/[locale]/(content)/blog/_components"
mkdir -p "app/[locale]/(content)/blog/_lib"
```

- [ ] **Step 2: 컴포넌트 이동 (kebab-case)**

```bash
git mv src/features/blog/components/BlogContent.tsx "app/[locale]/(content)/blog/_components/blog-content.tsx"
git mv src/features/blog/components/BlogPostCard.tsx "app/[locale]/(content)/blog/_components/blog-post-card.tsx"
git mv src/features/blog/components/BlogSearchFilter.tsx "app/[locale]/(content)/blog/_components/blog-search-filter.tsx"
git mv src/features/blog/components/CategoryBadges.tsx "app/[locale]/(content)/blog/_components/category-badges.tsx"
```

- [ ] **Step 3: hooks/utils 이동**

```bash
git mv src/features/blog/hooks/use-search-filter-params.ts "app/[locale]/(content)/blog/_lib/use-search-filter-params.ts"
git mv src/features/blog/hooks/use-sticky-detection.ts "app/[locale]/(content)/blog/_lib/use-sticky-detection.ts"
git mv src/features/blog/utils/notion-extractors.ts "app/[locale]/(content)/blog/_lib/notion-extractors.ts"
```

- [ ] **Step 4: 이동된 파일 내부 상대 import 갱신**

```bash
grep -rn "from '\.\." "app/[locale]/(content)/blog/_components" "app/[locale]/(content)/blog/_lib"
```

각 매치를 새 위치 기준으로 갱신. `notion-extractors.ts`가 도메인 타입을 import하면 `@/lib/content/blog`로.

- [ ] **Step 5: 외부 importer 업데이트**

```bash
grep -rn "from '@/features/blog'" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
grep -rn "from '@/features/blog/components\|from '@/features/blog/hooks\|from '@/features/blog/utils" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

각 importer에서 새 경로로 변경:
- `@/features/blog` (`BlogContent`, `BlogSearchFilter` 등) → 라우트 내부면 `'./_components/blog-content'`, 외부면 그 라우트 모듈 import 의도였는지 재검토
- `@/features/blog/components/CategoryBadges` → `from './_components/category-badges'` (라우트 내부)

검증:

```bash
grep -rn "from '@/features/blog" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 6: features/blog 잔여 정리**

```bash
git rm src/features/blog/index.ts
rmdir src/features/blog/components src/features/blog/hooks src/features/blog/utils src/features/blog/__tests__ src/features/blog
```

- [ ] **Step 7: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(blog): colocate route into _components/_lib"
```

### Task 3.6: cli 라우트

**Files:**
- Move 컴포넌트: `src/features/command-line/components/*.tsx` → `app/[locale]/cli/_components/*.tsx` (kebab-case)
- Move stores/utils/api/types: `src/features/command-line/{stores,utils,api,types}/*` → `app/[locale]/cli/_lib/`
- Move tests: `src/features/command-line/__tests__/*.test.ts` → `app/[locale]/cli/_lib/__tests__/`
- Delete: `src/features/command-line/` (전체)

- [ ] **Step 1: 폴더 생성**

```bash
mkdir -p "app/[locale]/cli/_components"
mkdir -p "app/[locale]/cli/_lib/__tests__"
```

- [ ] **Step 2: 컴포넌트 이동 (kebab-case)**

```bash
git mv src/features/command-line/components/Terminal.tsx "app/[locale]/cli/_components/terminal.tsx"
git mv src/features/command-line/components/donut-animation.tsx "app/[locale]/cli/_components/donut-animation.tsx"
git mv src/features/command-line/components/vim-editor.tsx "app/[locale]/cli/_components/vim-editor.tsx"
```

- [ ] **Step 3: _lib 파일 이동**

```bash
git mv src/features/command-line/stores/terminal-provider.tsx "app/[locale]/cli/_lib/terminal-provider.tsx"
git mv src/features/command-line/stores/terminal-store.ts "app/[locale]/cli/_lib/terminal-store.ts"
git mv src/features/command-line/utils/commands.ts "app/[locale]/cli/_lib/commands.ts"
git mv src/features/command-line/utils/executor.ts "app/[locale]/cli/_lib/executor.ts"
git mv src/features/command-line/utils/filesystem.ts "app/[locale]/cli/_lib/filesystem.ts"
git mv src/features/command-line/utils/lexer.ts "app/[locale]/cli/_lib/lexer.ts"
git mv src/features/command-line/utils/parser.ts "app/[locale]/cli/_lib/parser.ts"
git mv src/features/command-line/api/get-cli-data.ts "app/[locale]/cli/_lib/build-cli-data.ts"
git mv src/features/command-line/types/index.ts "app/[locale]/cli/_lib/types.ts"
```

(`build-cli-data.ts`로 함수 의도와 더 일치하는 이름 사용. 함수명 `buildCliData`와 매칭.)

- [ ] **Step 4: 테스트 이동**

```bash
git mv src/features/command-line/__tests__/commands.test.ts "app/[locale]/cli/_lib/__tests__/commands.test.ts"
git mv src/features/command-line/__tests__/executor.test.ts "app/[locale]/cli/_lib/__tests__/executor.test.ts"
git mv src/features/command-line/__tests__/filesystem.test.ts "app/[locale]/cli/_lib/__tests__/filesystem.test.ts"
git mv src/features/command-line/__tests__/lexer.test.ts "app/[locale]/cli/_lib/__tests__/lexer.test.ts"
git mv src/features/command-line/__tests__/parser.test.ts "app/[locale]/cli/_lib/__tests__/parser.test.ts"
```

- [ ] **Step 5: 이동된 파일 내부 상대 import 갱신**

```bash
grep -rn "from '\.\." "app/[locale]/cli/_components" "app/[locale]/cli/_lib"
```

각 매치를 새 경로로 갱신:
- `'../utils/commands'` → `'./commands'`
- `'../stores/terminal-store'` → `'./terminal-store'`
- `'../types'` → `'./types'`
- `'../components/...'` → `'../_components/...'` (terminal-store가 컴포넌트 import 한다면)

- [ ] **Step 6: 외부 importer 업데이트**

```bash
grep -rn "from '@/features/command-line" app/ src/ --include="*.ts" --include="*.tsx"
```

대상은 `app/[locale]/cli/page.tsx`:
- `from '@/features/command-line'` (`Terminal`, `TerminalProvider`) → `from './_components/terminal'`, `from './_lib/terminal-provider'`
- `from '@/features/command-line/api'` (`buildCliData`) → `from './_lib/build-cli-data'`

검증:

```bash
grep -rn "from '@/features/command-line" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 7: features/command-line 잔여 정리**

```bash
git rm src/features/command-line/api.ts
git rm src/features/command-line/index.ts
rmdir src/features/command-line/api src/features/command-line/components src/features/command-line/stores src/features/command-line/types src/features/command-line/utils src/features/command-line/__tests__ src/features/command-line
```

- [ ] **Step 8: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(cli): colocate route into _components/_lib"
```

### Task 3.7: chat 라우트 (페이지 UI vs API 백엔드 분리)

**Files:**
- Move 컴포넌트: `src/features/ai-chat/components/*.tsx` → `app/[locale]/chat/_components/*.tsx` (이미 kebab-case)
- Move stores/types: `src/features/ai-chat/stores/*`, `src/features/ai-chat/types/index.ts` → `app/[locale]/chat/_lib/`
- Move backend: `src/features/ai-chat/api/*`, `src/features/ai-chat/prompts/*` → `app/api/chat/_lib/`
- Delete: `src/features/ai-chat/` (전체)

**Why:** 페이지(`app/[locale]/chat/page.tsx`)는 ChatPage 등 UI만 import. 백엔드 함수(`buildSystemPrompt`, `fetchDynamicContext`)는 `app/api/chat/route.ts`만 import.

- [ ] **Step 1: 폴더 생성**

```bash
mkdir -p "app/[locale]/chat/_components"
mkdir -p "app/[locale]/chat/_lib"
mkdir -p "app/api/chat/_lib"
```

(`prompts/`는 Step 3에서 `git mv`로 디렉토리째 이동하므로 미리 만들지 않음.)

- [ ] **Step 2: 페이지 UI 이동**

```bash
git mv src/features/ai-chat/components/chat-page.tsx "app/[locale]/chat/_components/chat-page.tsx"
git mv src/features/ai-chat/components/chat-input.tsx "app/[locale]/chat/_components/chat-input.tsx"
git mv src/features/ai-chat/components/chat-messages.tsx "app/[locale]/chat/_components/chat-messages.tsx"
git mv src/features/ai-chat/components/chat-error.tsx "app/[locale]/chat/_components/chat-error.tsx"
git mv src/features/ai-chat/components/chat-suggestions.tsx "app/[locale]/chat/_components/chat-suggestions.tsx"
git mv src/features/ai-chat/stores/chat-provider.tsx "app/[locale]/chat/_lib/chat-provider.tsx"
git mv src/features/ai-chat/stores/chat-store.ts "app/[locale]/chat/_lib/chat-store.ts"
git mv src/features/ai-chat/types/index.ts "app/[locale]/chat/_lib/types.ts"
```

- [ ] **Step 3: 백엔드 이동**

```bash
git mv src/features/ai-chat/api/build-prompt.ts app/api/chat/_lib/build-prompt.ts
git mv src/features/ai-chat/api/fetch-context.ts app/api/chat/_lib/fetch-context.ts
```

prompts/ 폴더는 디렉토리째 이동 (`app/api/chat/_lib/prompts/`가 미리 만들어져 있으면 충돌하므로 mkdir 단계에서 `prompts/` 부분은 제외했음):

```bash
git mv src/features/ai-chat/prompts app/api/chat/_lib/prompts
```

이렇게 하면 내부 하위 폴더(`context/` 등)도 함께 이동된다.

- [ ] **Step 4: 이동된 파일 내부 상대 import 갱신**

```bash
grep -rn "from '\.\." "app/[locale]/chat/_components" "app/[locale]/chat/_lib" app/api/chat/_lib
```

각 매치 갱신:
- `'../stores/chat-store'` → `'../_lib/chat-store'` (컴포넌트 측) 또는 `'./chat-store'` (_lib 내부)
- `'../types'` → `'./types'`
- `'../prompts/...'` → `'./prompts/...'`

`fetch-context.ts`의 `@/lib/content/{blog,project}` 절대 import는 Phase 2에서 이미 갱신되어 그대로 유지된다 (절대 경로는 파일 이동에 영향받지 않음).

- [ ] **Step 5: 외부 importer 업데이트**

`app/[locale]/chat/page.tsx`:
- `from '@/features/ai-chat'` (`ChatPage`) → `from './_components/chat-page'`

`app/api/chat/route.ts`:
- `from '@/features/ai-chat/api/build-prompt'` → `from './_lib/build-prompt'`
- `from '@/features/ai-chat/api/fetch-context'` → `from './_lib/fetch-context'`

검증:

```bash
grep -rn "from '@/features/ai-chat" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 6: features/ai-chat 잔여 정리**

```bash
git rm src/features/ai-chat/index.ts
rmdir src/features/ai-chat/api src/features/ai-chat/components src/features/ai-chat/stores src/features/ai-chat/types src/features/ai-chat
```

- [ ] **Step 7: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(chat): split UI to [locale]/chat/_lib, backend to api/chat/_lib"
```

### Task 3.8: guestbook 라우트 (emotion 통합 + types 평탄화)

**Files:**
- Move 컴포넌트: `src/features/guestbook/components/*.tsx` → `app/[locale]/guestbook/_components/*.tsx` (kebab-case)
- Move hooks: `src/features/guestbook/hooks/*.ts` → `app/[locale]/guestbook/_lib/*.ts`
- Move api: `src/features/guestbook/api/{actions,list-guestbook.server}.ts` → `app/[locale]/guestbook/_lib/`
- Consolidate emotion: `src/features/guestbook/emotion/{constant,type,validation,index}.ts` → `app/[locale]/guestbook/_lib/emotion.ts` (1 파일로 통합)
- Move emotion hook: `src/features/guestbook/emotion/useEmotionEnum.ts` → `app/[locale]/guestbook/_lib/use-emotion-enum.ts`
- Consolidate types: `src/features/guestbook/types/{entities,types,validation,index}.ts` → `app/[locale]/guestbook/_lib/types.ts`
- Move tests: `src/features/guestbook/__tests__/*.test.ts` → `app/[locale]/guestbook/_lib/__tests__/`
- Delete: `src/features/guestbook/` (전체)

- [ ] **Step 1: 기존 파일 내용 검토**

```bash
cat src/features/guestbook/emotion/index.ts \
    src/features/guestbook/emotion/constant.ts \
    src/features/guestbook/emotion/type.ts \
    src/features/guestbook/emotion/validation.ts
cat src/features/guestbook/types/index.ts \
    src/features/guestbook/types/entities.ts \
    src/features/guestbook/types/types.ts \
    src/features/guestbook/types/validation.ts
```

- [ ] **Step 2: 폴더 생성**

```bash
mkdir -p "app/[locale]/guestbook/_components"
mkdir -p "app/[locale]/guestbook/_lib/__tests__"
```

- [ ] **Step 3: 컴포넌트 이동 (kebab-case)**

```bash
git mv src/features/guestbook/components/EmotionBadges.tsx "app/[locale]/guestbook/_components/emotion-badges.tsx"
git mv src/features/guestbook/components/EmotionButton.tsx "app/[locale]/guestbook/_components/emotion-button.tsx"
git mv src/features/guestbook/components/EmotionButtonGroup.tsx "app/[locale]/guestbook/_components/emotion-button-group.tsx"
git mv src/features/guestbook/components/GuestbookDetailDialog.tsx "app/[locale]/guestbook/_components/guestbook-detail-dialog.tsx"
git mv src/features/guestbook/components/GuestbookFormDialog.tsx "app/[locale]/guestbook/_components/guestbook-form-dialog.tsx"
git mv src/features/guestbook/components/GuestbookList.tsx "app/[locale]/guestbook/_components/guestbook-list.tsx"
git mv src/features/guestbook/components/GuestbookSkeleton.tsx "app/[locale]/guestbook/_components/guestbook-skeleton.tsx"
git mv src/features/guestbook/components/GuestbookWidget.tsx "app/[locale]/guestbook/_components/guestbook-widget.tsx"
```

- [ ] **Step 4: api/hooks 이동**

```bash
git mv src/features/guestbook/api/actions.ts "app/[locale]/guestbook/_lib/actions.ts"
git mv src/features/guestbook/api/list-guestbook.server.ts "app/[locale]/guestbook/_lib/list-guestbook.server.ts"
git mv src/features/guestbook/hooks/use-field-error.ts "app/[locale]/guestbook/_lib/use-field-error.ts"
git mv src/features/guestbook/hooks/use-turnstile-validation.ts "app/[locale]/guestbook/_lib/use-turnstile-validation.ts"
git mv src/features/guestbook/emotion/useEmotionEnum.ts "app/[locale]/guestbook/_lib/use-emotion-enum.ts"
```

`features/guestbook/api.ts`(barrel)도 삭제:

```bash
git rm src/features/guestbook/api.ts
```

- [ ] **Step 5: emotion 통합 (`_lib/emotion.ts` 새로 작성)**

기존 `emotion/{constant,type,validation,index}.ts`의 내용을 한 파일로 모은다:

`app/[locale]/guestbook/_lib/emotion.ts`:

```typescript
// 1. 외부 import (zod 등이 필요하면)
// 2. 타입 정의 (기존 emotion/type.ts 내용)
// 3. 상수 정의 (기존 emotion/constant.ts 내용)
// 4. validation 함수 (기존 emotion/validation.ts 내용)
// 5. emotion/index.ts에서 re-export 했던 식별자가 모두 같은 파일에서 export 되도록
```

함수/타입 명은 변경 없이 유지 (`EmotionCode`, `EmotionOption`, `normalizeGuestbookEmotions` 등).

검증: 외부에서 `import {...} from '@/features/guestbook/emotion'`로 가져오던 모든 식별자가 새 파일에서 export되는지 확인.

```bash
grep -rn "from '@/features/guestbook/emotion'" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

각 importer가 가져오는 식별자 목록을 정리해서 새 emotion.ts에 모두 포함되어 있는지 확인.

- [ ] **Step 6: 기존 emotion 폴더 삭제**

```bash
git rm src/features/guestbook/emotion/index.ts
git rm src/features/guestbook/emotion/constant.ts
git rm src/features/guestbook/emotion/type.ts
git rm src/features/guestbook/emotion/validation.ts
rmdir src/features/guestbook/emotion
```

- [ ] **Step 7: types 통합 (`_lib/types.ts` 새로 작성)**

기존 `types/{entities,types,validation,index}.ts`를 한 파일로 통합. 식별자 이름은 그대로.

```bash
cat src/features/guestbook/types/*.ts > /tmp/guestbook-types-merge.ts
# 위 출력을 검토하여 중복 import 정리, 단일 파일로 정리한 뒤 새 위치에 작성
```

새 위치: `app/[locale]/guestbook/_lib/types.ts`.

- [ ] **Step 8: 기존 types 폴더 삭제**

```bash
git rm src/features/guestbook/types/index.ts
git rm src/features/guestbook/types/entities.ts
git rm src/features/guestbook/types/types.ts
git rm src/features/guestbook/types/validation.ts
rmdir src/features/guestbook/types
```

- [ ] **Step 9: 테스트 이동**

```bash
git mv src/features/guestbook/__tests__/actions.test.ts "app/[locale]/guestbook/_lib/__tests__/actions.test.ts"
git mv src/features/guestbook/__tests__/emotion-type.test.ts "app/[locale]/guestbook/_lib/__tests__/emotion-type.test.ts"
git mv src/features/guestbook/__tests__/emotion-validation.test.ts "app/[locale]/guestbook/_lib/__tests__/emotion-validation.test.ts"
git mv src/features/guestbook/__tests__/form-validation.test.ts "app/[locale]/guestbook/_lib/__tests__/form-validation.test.ts"
```

- [ ] **Step 10: 이동된 파일 내부 상대 import 갱신**

```bash
grep -rn "from '\.\." "app/[locale]/guestbook/_components" "app/[locale]/guestbook/_lib"
```

각 매치 갱신. 핵심 패턴:
- `from '@/features/guestbook/emotion'` → `from './emotion'` (_lib 내부) 또는 `from '../_lib/emotion'` (_components 내부)
- `from '@/features/guestbook/types'` → `from './types'` 또는 `from '../_lib/types'`
- `from '@/features/guestbook/components/GuestbookList'` → `from './guestbook-list'` (_components 내부 cross-import)

- [ ] **Step 11: 외부 importer 업데이트**

```bash
grep -rn "from '@/features/guestbook" app/ src/ --include="*.ts" --include="*.tsx"
```

대상:
- `app/[locale]/guestbook/page.tsx`: `GuestbookWidget`, `fetchAllGuestbookEntries` 등 → `from './_components/guestbook-widget'`, `from './_lib/list-guestbook.server'`
- `app/[locale]/guestbook/loading.tsx`: `GuestbookListSkeleton` 등 → `from './_components/...'`

이전 Phase에서 임시 import 되었던 곳도 모두 갱신.

검증:

```bash
grep -rn "from '@/features/guestbook" app/ src/ --include="*.ts" --include="*.tsx"
```

Expected: 빈 결과.

- [ ] **Step 12: features/guestbook 잔여 정리**

```bash
git rm src/features/guestbook/index.ts
rmdir src/features/guestbook/api src/features/guestbook/components src/features/guestbook/hooks src/features/guestbook/__tests__ src/features/guestbook
```

- [ ] **Step 13: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor(guestbook): colocate route, consolidate emotion and types"
```

---

## Phase 4: 잔여 정리

### Task 4.1: `useTheme` hook 추출 후 `src/app/` 삭제

**Files:**
- Create: `src/hooks/use-theme.ts` — 기존 `src/app/providers/theme-provider.tsx`의 `useTheme` hook만 추출
- Delete: `src/app/providers/theme-provider.tsx`, `src/app/providers/`, `src/app/README.md`, `src/app/`
- Modify: `src/components/ui/theme-switch.tsx` (import 경로 변경)

**Why:** `ThemeProvider` 래퍼는 미사용 (layout.tsx가 next-themes 직접 사용). `useTheme` hook은 1곳(`theme-switch.tsx`)에서 사용 중 → `src/hooks/`로 이주.

- [ ] **Step 1: 기존 useTheme 코드 확인**

```bash
cat src/app/providers/theme-provider.tsx
```

`useTheme` 함수 부분만 추출 대상. `ThemeProvider` 래퍼 컴포넌트는 폐기.

- [ ] **Step 2: `src/hooks/use-theme.ts` 작성**

`useTheme` 함수와 그 의존(`Theme` 타입, `useNextTheme` import 등)만 새 파일로 옮긴다. 코드:

```typescript
'use client';

import {useEffect, useState} from 'react';

import {useTheme as useNextTheme} from 'next-themes';

type Theme = 'light' | 'dark';

export function useTheme() {
  const nextTheme = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const resolvedTheme = (() => {
    const theme = nextTheme.resolvedTheme ?? nextTheme.theme ?? 'light';
    return (theme === 'dark' ? 'dark' : 'light') as Theme;
  })();

  const setTheme = (value: Theme | ((prev: Theme) => Theme)) => {
    const nextValue = typeof value === 'function' ? value(resolvedTheme) : value;
    nextTheme.setTheme(nextValue);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return {
    clientMounted: mounted,
    theme: resolvedTheme,
    toggleTheme,
    setTheme,
    systemTheme: nextTheme.systemTheme,
  };
}
```

- [ ] **Step 3: `theme-switch.tsx` import 갱신**

`src/components/ui/theme-switch.tsx`:
- `from '@/app/providers/theme-provider'` → `from '@/hooks/use-theme'`

- [ ] **Step 4: `src/app/` 삭제**

```bash
git rm src/app/providers/theme-provider.tsx
git rm src/app/README.md
rmdir src/app/providers
rmdir src/app
```

(이전 Phase에서 `src/app/api-routes/`와 `src/app/providers/{client-providers,query-provider}.tsx`는 이미 제거됨.)

- [ ] **Step 5: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor: move useTheme to src/hooks, drop src/app"
```

### Task 4.2: `src/components/mdx/` 평탄화

**Files:**
- Move: `src/components/mdx/mdx-components.tsx` → `src/components/mdx-components.tsx`
- Delete: `src/components/mdx/`

- [ ] **Step 1: 사용처 확인**

```bash
grep -rn "from '@/components/mdx" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

- [ ] **Step 2: 파일 이동**

```bash
git mv src/components/mdx/mdx-components.tsx src/components/mdx-components.tsx
rmdir src/components/mdx
```

- [ ] **Step 3: importer 업데이트**

각 importer에서 `from '@/components/mdx/mdx-components'` 또는 `from '@/components/mdx'` → `from '@/components/mdx-components'`.

- [ ] **Step 4: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor: flatten src/components/mdx folder"
```

### Task 4.3: `src/lib/turnstile/` 내부 평탄화

**Files:**
- Move: `src/lib/turnstile/ui/Turnstile.tsx` → `src/lib/turnstile/turnstile.tsx`
- Move: `src/lib/turnstile/lib/useTurnstile.ts` → `src/lib/turnstile/use-turnstile.ts`
- Move: `src/lib/turnstile/lib/verify.ts` → `src/lib/turnstile/verify.ts`
- Move: `src/lib/turnstile/config/constant.ts` → `src/lib/turnstile/constants.ts`
- Move tests: `src/lib/turnstile/__tests__/*` (있다면 그대로 유지)
- Modify: `src/lib/turnstile/index.ts` (re-export 경로 갱신)

- [ ] **Step 1: 현재 구조 확인**

```bash
ls -la src/lib/turnstile/ src/lib/turnstile/ui/ src/lib/turnstile/lib/ src/lib/turnstile/config/ src/lib/turnstile/__tests__/ 2>&1
cat src/lib/turnstile/index.ts
```

- [ ] **Step 2: 파일 이동 (kebab-case 적용)**

```bash
git mv src/lib/turnstile/ui/Turnstile.tsx src/lib/turnstile/turnstile.tsx
git mv src/lib/turnstile/lib/useTurnstile.ts src/lib/turnstile/use-turnstile.ts
git mv src/lib/turnstile/lib/verify.ts src/lib/turnstile/verify.ts
git mv src/lib/turnstile/config/constant.ts src/lib/turnstile/constants.ts
rmdir src/lib/turnstile/ui src/lib/turnstile/lib src/lib/turnstile/config
```

- [ ] **Step 3: 이동된 파일 내부 상대 import 갱신 + index.ts 갱신**

```bash
grep -rn "from '\.\./" src/lib/turnstile/
```

각 매치를 새 위치 기준 상대 경로로 갱신:
- 파일이 같은 폴더에 있으면 `'./...'`
- 테스트 파일은 `'../...'`

`src/lib/turnstile/index.ts`도 `from './ui/Turnstile'` 등을 `from './turnstile'`로 갱신.

- [ ] **Step 4: 외부 importer 확인 (대부분 `@/lib/turnstile` barrel 사용)**

```bash
grep -rn "from '@/lib/turnstile" app/ src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

barrel(`@/lib/turnstile`)만 import하면 외부는 변경 불필요. `@/lib/turnstile/ui/...` 같은 직접 import이 있다면 `@/lib/turnstile/turnstile`로 갱신.

- [ ] **Step 5: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "refactor: flatten src/lib/turnstile internal subfolders"
```

### Task 4.4: `src/features/` 디렉토리 완전 삭제

**Files:**
- Delete: `src/features/` (모든 sub-feature는 Phase 3에서 비워짐)

- [ ] **Step 1: 비어있는지 확인**

```bash
find src/features -type f 2>&1
ls src/features 2>&1
```

Expected: 빈 결과 (또는 빈 디렉토리만).

- [ ] **Step 2: 삭제**

```bash
rm -rf src/features
```

(이미 git이 추적하지 않으므로 `git rm` 불필요. 모든 파일이 위 Phase에서 `git rm`/`git mv`로 이동됨.)

- [ ] **Step 3: 검증**

```bash
git status
pnpm tsc --noEmit && pnpm test
```

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: remove empty src/features directory"
```

### Task 4.5: `tsconfig.json` paths 정리

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: paths 갱신**

`tsconfig.json`:
- `"@/features/*": ["./src/features/*"]` 라인 제거

최종:

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

- [ ] **Step 2: 검증 + 커밋**

```bash
rm -rf .next
pnpm tsc --noEmit && pnpm test
git add tsconfig.json
git commit -m "chore: drop @/features/* alias from tsconfig"
```

### Task 4.6: ESLint 룰 갱신

**Files:**
- Modify: `eslint.config.mjs`

**변경 사항:**
- `pathGroups`에서 `@/app/**`, `@/features/**`, 그리고 legacy `@/pages/**`, `@/widgets/**`, `@/entities/**`, `@/shared/**` 제거
- `import/no-restricted-paths`의 zones 전체 제거 (Bulletproof unidirectional 규칙은 features 폴더가 사라졌으므로 의미 없음)
- 새로운 unidirectional 규칙: `src/lib`, `src/components`, `src/hooks`, `src/utils`, `src/config`, `src/types` 사이의 역방향 import 금지는 추가 가능하지만 본 작업 범위에서는 단순화 우선

- [ ] **Step 1: `eslint.config.mjs` 갱신**

`pathGroups` 항목을 다음으로 교체:

```javascript
pathGroups: [
  // 1. External libraries (React, Next)
  {pattern: 'react', group: 'external', position: 'before'},
  {pattern: 'next/**', group: 'external', position: 'before'},

  // 2. Shared layers
  {pattern: '@/components/**', group: 'internal', position: 'before'},
  {pattern: '@/hooks/**', group: 'internal', position: 'before'},
  {pattern: '@/lib/**', group: 'internal', position: 'before'},
  {pattern: '@/config/**', group: 'internal', position: 'before'},
  {pattern: '@/types/**', group: 'internal', position: 'before'},
  {pattern: '@/utils/**', group: 'internal', position: 'before'},
],
```

`import/no-restricted-paths` 룰 전체 제거.

- [ ] **Step 2: 검증 + 커밋**

```bash
pnpm lint
git add eslint.config.mjs
git commit -m "chore: drop Bulletproof React import restrictions from ESLint"
```

### Task 4.7: `CLAUDE.md` 업데이트

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 섹션 교체**

다음 섹션들을 제거 또는 교체:

**제거:** "Bulletproof React 구조", "Feature 폴더 구조", "의존성 규칙", "App Router 연결"

**대체 추가:** "Route-Colocated 구조" 섹션 (간단한 설명):

```markdown
## Route-Colocated 구조

각 라우트는 자기 UI/로직을 소유한다.

\`\`\`
app/
├── [locale]/<route>/
│   ├── page.tsx, layout.tsx, ...
│   ├── _components/         # 라우트 전용 UI
│   └── _lib/                # 라우트 전용 데이터/훅/스토어/타입
├── api/<route>/
│   ├── route.ts
│   └── _lib/                # route handler 보조 로직
└── globals.css

src/
├── components/
│   ├── ui/                  # shadcn primitives
│   ├── layout/              # 글로벌 레이아웃
│   └── notion/              # cross-route 공유 (Notion 렌더)
├── hooks/                   # cross-route 공유 훅
├── lib/
│   ├── api/                 # API 클라이언트 (supabase, notion, spotify, ...)
│   ├── content/             # blog/project/resume 데이터 페처 (cross-route)
│   ├── i18n/, security/, turnstile/, webview/
├── config/, types/, utils/
\`\`\`

### 의존성 규칙
- `app/` → `src/` 단방향. `src/`는 `app/`을 import 하지 않음.
- 라우트 자기 코드(`_components`, `_lib`)는 같은 라우트 내부 또는 `src/`만 import.
- 두 개 이상의 라우트(또는 sitemap, api route)에서 import 되면 → `src/`로 추출.
```

**기술 스택 섹션:**

`TanStack React Query` 라인 제거.

- [ ] **Step 2: 커밋**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE): replace Bulletproof React with route-colocated structure"
```

### Task 4.8: 사용자 메모리(`MEMORY.md`) 업데이트

**Files:**
- Modify: `/Users/mzc01-tngur1120/.claude/projects/-Users-mzc01-tngur1120-dev-toy-hongsoohyuk/memory/MEMORY.md`

- [ ] **Step 1: 다음 라인 제거**

`Key Patterns & Conventions` 섹션:
- `Bulletproof React 아키텍처: features → features import 금지, app → features 허용`

`Lessons Learned` 섹션:
- `feature 간 데이터 집계는 app layer에서 수행 → features는 순수 변환 함수만 export`

- [ ] **Step 2: 새 항목 추가 (Key Patterns)**

```markdown
- Route-Colocated 구조: `app/[locale]/<route>/_components/`, `_lib/`. cross-route 공유는 `src/lib/content/` 등으로 추출
```

- [ ] **Step 3: 메모리 파일 갱신은 git 추적 외부이므로 커밋 불필요**

(메모리는 사용자 홈 디렉토리에 저장되어 git 추적 대상이 아님.)

---

## Phase 5: 파일명 kebab-case 정규화 (Phase 3에서 이미 적용된 부분 외)

Phase 3에서 라우트 이동 시 PascalCase 컴포넌트는 kebab-case로 동시 변경했음. 이 Phase는 그 외 잔여 파일을 정규화한다.

### Task 5.1: 잔여 PascalCase/camelCase 파일 식별

- [ ] **Step 1: PascalCase/camelCase 후보 검색**

```bash
find app/ src/ -type f \( -name "*.ts" -o -name "*.tsx" \) | grep -v "node_modules\|\.next\|wasm" | grep -E "/[A-Z][a-z]|[a-z][A-Z]" | grep -v ".d.ts$" | sort
```

`*.d.ts`는 제외. UI primitives의 PascalCase는 shadcn/ui 컨벤션에 따라 일부 유지(예: `ScrollVelocity.tsx`, `InfiniteListTrigger.tsx`)할지 사용자 컨벤션 확인.

CLAUDE.md "kebab-case" 규칙은 일관 적용 → 모두 변경 권장.

- [ ] **Step 2: 후보 목록을 task 5.2 ~ 5.4로 분배**

식별된 파일들을 components/ui, hooks 등 카테고리별로 그룹화한 뒤 다음 sub-task에서 일괄 rename.

### Task 5.2: `src/components/ui/` PascalCase → kebab-case

**예상 대상:**
- `ScrollVelocity.tsx` → `scroll-velocity.tsx`
- `InfiniteListTrigger.tsx` → `infinite-list-trigger.tsx`

(다른 파일은 이미 kebab-case)

- [ ] **Step 1: rename**

```bash
git mv src/components/ui/ScrollVelocity.tsx src/components/ui/scroll-velocity.tsx
git mv src/components/ui/InfiniteListTrigger.tsx src/components/ui/infinite-list-trigger.tsx
```

- [ ] **Step 2: importer 갱신**

```bash
grep -rn "from '@/components/ui/ScrollVelocity\|from '@/components/ui/InfiniteListTrigger" app/ src/ --include="*.ts" --include="*.tsx"
```

각 매치 갱신.

- [ ] **Step 3: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "chore: rename ui primitives to kebab-case"
```

### Task 5.3: `src/hooks/useDialogController.ts` rename

- [ ] **Step 1: rename**

```bash
git mv src/hooks/useDialogController.ts src/hooks/use-dialog-controller.ts
```

- [ ] **Step 2: importer 갱신**

```bash
grep -rn "useDialogController\|use-dialog-controller" app/ src/ --include="*.ts" --include="*.tsx"
```

`from '@/hooks/useDialogController'` → `from '@/hooks/use-dialog-controller'`. (식별자 이름 자체는 `useDialogController`로 유지.)

- [ ] **Step 3: 검증 + 커밋**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "chore: rename use-dialog-controller hook to kebab-case"
```

### Task 5.4: 그 외 잔여 파일 식별 및 일괄 rename

Phase 5.1에서 발견된 파일들을 일괄 처리. 각 파일별로:

- [ ] **Step 1: 후보 파일 1개씩 `git mv`**

```bash
git mv <오래된 경로> <새 kebab-case 경로>
```

- [ ] **Step 2: importer grep + 갱신**

```bash
grep -rn "<옛 파일명 일부>" app/ src/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 3: 검증 + 커밋 (5개 단위로 묶어서 커밋해도 됨)**

```bash
pnpm tsc --noEmit && pnpm test
git add -A
git commit -m "chore: rename <files> to kebab-case"
```

---

## Phase 6: 최종 검증

### Task 6.1: 풀 빌드 + 타입 + 린트 + 단위 테스트

- [ ] **Step 1: 캐시 정리**

```bash
rm -rf .next tsconfig.tsbuildinfo
```

- [ ] **Step 2: 타입 체크**

```bash
pnpm tsc --noEmit
```

Expected: 통과.

- [ ] **Step 3: 린트**

```bash
pnpm lint
```

Expected: error 없음.

- [ ] **Step 4: 단위 테스트**

```bash
pnpm test
```

Expected: 모든 테스트 통과.

- [ ] **Step 5: 빌드**

```bash
pnpm build
```

Expected: 통과. 빌드 결과물에 모든 라우트(/, /chat, /cli, /guestbook, /instagram, /blog, /blog/[slug], /project, /project/[slug], /resume + /api/* 모두) 포함.

### Task 6.2: E2E 테스트

- [ ] **Step 1: Playwright 실행**

```bash
pnpm test:e2e
```

Expected: 통과.

### Task 6.3: 수동 smoke 테스트

- [ ] **Step 1: 개발 서버 기동**

```bash
pnpm dev --port 3000
```

- [ ] **Step 2: 라우트별 브라우저 확인**

다음 라우트가 모두 정상 렌더되는지 확인:

| URL | 확인 포인트 |
| --- | --- |
| `/` | HeroTitle 렌더 |
| `/blog` | 블로그 목록, 검색 필터 |
| `/blog/<slug>` | 블로그 상세 |
| `/project` | 프로젝트 카드 목록 |
| `/project/<slug>` | 프로젝트 상세, Notion 블록 렌더 |
| `/resume` | 이력서 (Notion 렌더) |
| `/cli` | 터미널 부팅, 명령 실행 |
| `/chat` | 메시지 전송, AI 응답 |
| `/guestbook` | 방명록 목록, emotion 선택, 작성 폼 |
| `/instagram` | 피드 로드 |

- [ ] **Step 2: API 라우트 확인**

- `/api/chat` POST: 채팅 페이지에서 메시지 전송 시 200
- `/api/revalidate/blog` GET (`Authorization: Bearer $CRON_SECRET`): 200, `{revalidated: true, ...}`
- `/api/spotify/authorize` (브라우저 접근): Spotify OAuth 페이지로 redirect

### Task 6.4: 최종 커밋 (남은 변경분)

- [ ] **Step 1: 미커밋 변경 확인**

```bash
git status
```

- [ ] **Step 2: 남아있다면 단일 커밋**

```bash
git add -A
git commit -m "chore: finalize route-colocated restructure"
```

---

## 회귀 위험 체크리스트

각 Phase 마지막 또는 의심 시 확인:

- [ ] `'use server'` directive가 있는 파일들은 이동 후에도 directive가 유지되는가?
- [ ] `.server.ts` 파일명이 보존되었는가? (예: `list-guestbook.server.ts`)
- [ ] `'use client'` directive가 있는 파일들은 이동 후에도 유지되는가?
- [ ] Notion 렌더링이 끊김 없이 동작하는가? (`@/components/notion`을 직접 사용)
- [ ] 환경변수 사용 (`process.env.GUESTBOOK_HMAC_SECRET`, `process.env.CRON_SECRET` 등)이 동일하게 동작하는가?
- [ ] React Compiler가 빌드 시 문제 없이 통과하는가?
- [ ] i18n 라우팅(next-intl)이 정상 동작하는가? (`/en/...`, `/ko/...`)
- [ ] `searchParams`/`params`의 async 처리가 보존되었는가?
- [ ] Vercel Cron `/api/revalidate/blog`가 호출 가능한가?
