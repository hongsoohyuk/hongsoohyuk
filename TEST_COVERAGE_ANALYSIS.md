# Test Coverage Analysis

## Current State

### Overall Coverage (Jest)

| Metric     | Coverage |
|------------|----------|
| Statements | 9.29%    |
| Branches   | 11.86%   |
| Functions  | 6.21%    |
| Lines      | 9.27%    |

**Test results:** 52 tests total (47 passing, 5 failing), across 5 test files.

### Existing Tests

All unit tests live in a single feature — `src/features/project/__tests__/`:

| Test file | Tests | What it covers |
|-----------|-------|----------------|
| `NotionBlocks.test.tsx` | 13 | Rendering of all Notion block types |
| `NotionRichText.test.tsx` | 12 | Rich text formatting (bold, italic, links, etc.) |
| `ProjectCard.test.tsx` | 4 | Card rendering and navigation (**5 failing — missing `useFormatter` mock**) |
| `get-project-detail.test.ts` | 7 | Page retrieval, slug conversion, error handling |
| `get-project-list.test.ts` | 8 | Pagination, filtering, slug generation |

E2E tests (Playwright, `e2e/` directory):

| Test file | Tests | What it covers |
|-----------|-------|----------------|
| `project-list.spec.ts` | 10 | Page layout, cards, pagination, mobile, i18n |
| `project-detail.spec.ts` | 11 | Detail display, navigation, block rendering, mobile |

### Failing Tests

`ProjectCard.test.tsx` has 5 failures due to `useFormatter` from `next-intl` not being mocked in `jest.setup.ts`. The setup mocks `useTranslations` but not `useFormatter`, which `LocalDateTime` component uses.

---

## Coverage Gaps By Priority

### Priority 1 — Pure Logic (High value, easy to test)

These files contain deterministic logic with no framework dependencies. They should be the first targets.

#### `src/utils/date.ts` — 0% coverage
- `formatDate()` — date string formatting
- `formatDateTime()` — datetime formatting
- `truncateText()` — string truncation with ellipsis
- `isValidEmail()` — email regex validation

**Why it matters:** `isValidEmail` is used for input validation. A bug here silently accepts bad input or rejects good input.

#### `src/utils/number.ts` — 0% coverage
- `parsePositiveInt()` — parses strings/arrays to positive integers, returns null on failure

**Why it matters:** Used for parsing URL parameters (pagination). Edge cases like `"0"`, `"-1"`, `["", "5"]`, `null`, `undefined` all need verification.

#### `src/features/guestbook/emotion/validation.ts` — 0% coverage
- `toggleEmotion()` — add/remove emotions with max-2 constraint
- `isValidEmotionSet()` — validates uniqueness + max count

**Why it matters:** Business logic that enforces the 2-emotion limit. If `toggleEmotion` has an off-by-one error, users can select more emotions than allowed.

#### `src/features/guestbook/types/validation.ts` — 0% coverage
- Zod schema for guestbook form: `author_name`, `message`, `emotions`

**Why it matters:** This schema is the single source of truth for form validation. Testing it documents the contract (min/max lengths, required fields) and catches regressions when constraints change.

---

### Priority 2 — Shared Infrastructure (High impact across the app)

#### `src/lib/api/http.ts` — 0% coverage (172 lines)
The `HttpClient` class is the foundation of all API communication:
- URL construction with query parameters
- Request timeout handling
- Retry logic with exponential backoff
- Error handling (JSON, text, binary responses)
- `HttpError` class with status codes

**Why it matters:** Every feature depends on this. A retry bug could cause cascade failures or silent data loss. The timeout, backoff, and error-classification logic have many edge cases.

**Suggested test cases:**
- URL building: base URL joining, query parameter encoding, null/undefined filtering
- Timeout: requests that exceed the limit throw
- Retry: retries on 429/500/503, does not retry on 400/404, exponential backoff timing
- Error handling: `HttpError` created with correct status/data for non-OK responses
- Content type parsing: JSON, text, binary, and unknown types

#### `src/lib/api/notion-blocks.ts` — 0% coverage
- `getNotionBlockChildren()` — single-level block fetch
- `getNotionBlockChildrenRecursive()` — recursive tree traversal

**Why it matters:** Recursive function that builds the entire page content tree. A bug here could silently drop nested blocks or cause infinite recursion if the API returns unexpected data.

---

### Priority 3 — Shared Hooks (Medium complexity, medium impact)

#### `src/hooks/useDialogController.ts` — 0% coverage
- State management hook: `open()`, `close()`, `isOpen`

**Suggested tests:** Initial state (default false, custom true), `open()` sets true, `close()` sets false, multiple toggles.

#### `src/hooks/use-intersection-observer.ts` — 0% coverage
- IntersectionObserver wrapper with enable/disable

**Suggested tests:** Mock IntersectionObserver, verify `onIntersect` fires on intersection, observer disconnects on cleanup, respects `enabled` flag.

#### `src/hooks/use-dark-mode.ts` — 0% coverage
- Theme toggle with system preference detection

#### `src/hooks/use-dom-ready.ts` — 0% coverage
- SSR-safe DOM readiness check

---

### Priority 4 — Untested Features (Entire features with 0% coverage)

#### Guestbook (`src/features/guestbook/`) — 13 files, 0% tested

This is the most critical untested feature because it involves **user input, server actions, and database writes**.

Key files needing tests:
- `api/actions.ts` — Server action: form parsing, Zod validation, fingerprinting, Supabase insert, error handling, cache revalidation
- `components/GuestbookFormDialog.tsx` — Form submission UX
- `components/GuestbookList.tsx` — List rendering
- `emotion/useEmotionEnum.ts` — Emotion state management

**Why it matters:** This is a write path. Bugs here can write bad data to the database, expose error details to users, or silently fail.

#### Blog (`src/features/blog/`) — 8 files, 0% tested

Key files:
- `api/get-blog-list.ts` — Blog listing with Notion API
- `api/get-blog-detail.ts` — Blog detail fetching
- `components/BlogSearchFilter.tsx` — Client-side search/filter logic

#### Instagram (`src/features/instagram/`) — 11 files, 0% tested

Key files:
- `api/list-post.ts` — Post listing from Instagram API
- `api/get-profile.ts` — Profile data fetching
- `components/PostMediaViewer.tsx` — 139 lines, handles media display with carousel logic

---

### Priority 5 — Security-Sensitive Code

#### `src/lib/security/client-fingerprint.ts` — 0% coverage
- HMAC-SHA256 hashing of client IP and User-Agent
- IP extraction from `x-forwarded-for` header

**Why it matters:** Security code that handles PII hashing. If IP parsing breaks (e.g., multiple IPs in `x-forwarded-for`), fingerprinting fails silently with empty hashes.

#### `src/lib/turnstile/` — 0% coverage
- Cloudflare Turnstile CAPTCHA integration
- `useTurnstile.ts` (206 lines) — complex state machine for CAPTCHA lifecycle

---

## Existing Test Infrastructure Issues

### 1. Broken mock in `jest.setup.ts`
The `next-intl` mock is incomplete — it mocks `useTranslations` but not `useFormatter`. This causes all 5 `ProjectCard.test.tsx` tests to fail. Fix:

```ts
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (n: number) => String(n),
    relativeTime: (date: Date) => date.toISOString(),
  }),
}));
```

### 2. No coverage thresholds
There are no minimum coverage thresholds in `jest.config.mjs`. Adding thresholds prevents coverage from regressing:

```js
coverageThreshold: {
  global: {
    statements: 30,
    branches: 25,
    functions: 25,
    lines: 30,
  },
},
```

### 3. No CI integration
Tests don't appear to run in CI. Coverage reports should be generated and checked automatically on PRs.

---

## Recommended Action Plan

### Phase 1 — Quick wins (fix what exists, test pure logic)
1. Fix `jest.setup.ts` to mock `useFormatter` — unblocks 5 failing tests
2. Add tests for `src/utils/date.ts` (4 functions)
3. Add tests for `src/utils/number.ts` (1 function)
4. Add tests for `src/features/guestbook/emotion/validation.ts` (2 functions)
5. Add tests for `src/features/guestbook/types/validation.ts` (Zod schema)

**Expected impact:** Fixes 5 broken tests + adds ~20-25 new test cases for pure logic.

### Phase 2 — Core infrastructure
6. Add tests for `src/lib/api/http.ts` (HttpClient class)
7. Add tests for shared hooks (`useDialogController`, `useIntersectionObserver`)
8. Add coverage thresholds to `jest.config.mjs`

**Expected impact:** Covers the code every feature depends on. ~30-40 new test cases.

### Phase 3 — Feature coverage
9. Add tests for guestbook server action (`actions.ts`) — mock Supabase and fingerprint
10. Add tests for blog API functions
11. Add tests for Instagram API functions
12. Add component tests for interactive components (GuestbookFormDialog, BlogSearchFilter)

### Phase 4 — Security and E2E expansion
13. Add tests for `client-fingerprint.ts`
14. Add tests for Turnstile integration
15. Expand E2E tests to cover guestbook submission flow, blog browsing, and Instagram feed
