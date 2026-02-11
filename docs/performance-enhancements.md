# Performance Enhancements

Based on the [Vercel React Best Practices](https://github.com/vercel/react-best-practices) (v1.0.0, Jan 2026), a comprehensive audit was performed across all 8 rule categories. This document summarizes the issues found and the fixes applied.

## Changes Overview

| # | Rule | Priority | Files Changed |
|---|------|----------|---------------|
| 1 | `server-cache-react` | CRITICAL | `get-project-detail.ts`, `get-resume-page.ts` |
| 2 | `bundle-dynamic-imports` | CRITICAL | `HeroTitle.tsx` |
| 3 | `async-parallel` | CRITICAL | `resume/page.tsx`, `project/[slug]/page.tsx`, `project/page.tsx` |
| 4 | `rendering-hoist-jsx` | HIGH | `ScrollVelocity.tsx` |
| 5 | `rendering-content-visibility` | MEDIUM | `InstagramFeed.tsx`, `FeedItem.tsx` |
| 6 | `bundle-barrel-imports` | MEDIUM | `guestbook/types/index.ts` |
| 7 | `rerender-dependencies` | MEDIUM | `useTurnstile.ts` |

---

## 1. React.cache() for Server Fetch Deduplication

**Rule:** `server-cache-react` — Use `React.cache()` for per-request deduplication

**Problem:** `getProjectDetail` was called in both `generateMetadata` and the page component for `project/[slug]/page.tsx`, causing **duplicate Notion API calls** per page load.

**Fix:** Wrapped `getProjectDetail` and `getResumePage` with `React.cache()`, which deduplicates calls with the same arguments within a single server request.

```ts
// Before
export async function getProjectDetail(slug: string) { ... }

// After
import { cache } from 'react';
export const getProjectDetail = cache(async function getProjectDetail(slug: string) { ... });
```

**Files:**
- `src/features/project/api/pages/get-project-detail.ts`
- `src/features/resume/api/get-resume-page.ts`

---

## 2. Dynamic Import for ScrollVelocity (motion library)

**Rule:** `bundle-dynamic-imports` — Use `next/dynamic` for heavy components

**Problem:** The `ScrollVelocity` component imports the entire `motion/react` library (framer-motion). This was loaded statically on the home page, adding significant JS to the initial bundle for a single animation.

**Fix:** Used `next/dynamic` with `ssr: false` to lazy-load the component.

```tsx
// Before
import { ScrollVelocity } from '@/components/ui/ScrollVelocity';

// After
import dynamic from 'next/dynamic';
const ScrollVelocity = dynamic(
  () => import('@/components/ui/ScrollVelocity').then((mod) => ({ default: mod.ScrollVelocity })),
  { ssr: false },
);
```

**Files:**
- `src/features/home/components/HeroTitle.tsx`

---

## 3. Parallelize Independent Server Awaits

**Rule:** `async-parallel` — Use `Promise.all()` for independent operations

**Problem:** Multiple pages awaited `getTranslations()` and data fetch functions sequentially, creating unnecessary waterfalls. These calls are independent and can run in parallel.

**Fix:** Combined independent awaits with `Promise.all()`.

```tsx
// Before
const t = await getTranslations({ locale, namespace: 'Resume' });
const data = await getResumePage(); // blocked by getTranslations

// After
const [t, data] = await Promise.all([
  getTranslations({ locale, namespace: 'Resume' }),
  getResumePage(),
]);
```

**Files:**
- `app/[locale]/resume/page.tsx`
- `app/[locale]/project/[slug]/page.tsx`
- `app/[locale]/project/page.tsx`

---

## 4. Extract VelocityText Component and Hoist Defaults

**Rule:** `rendering-hoist-jsx` — Extract static JSX and components outside render

**Problem:** `VelocityText` was defined as a function **inside** `ScrollVelocity`. Since it contains React hooks (`useMotionValue`, `useScroll`, `useAnimationFrame`, etc.), this violated React's rules — hooks in nested function components that are recreated on every render can lead to undefined behavior. Additionally, the default `velocityMapping` object was created inline, causing a new reference on every render.

**Fix:**
- Extracted `VelocityText` as a standalone top-level component
- Hoisted `DEFAULT_VELOCITY_MAPPING` to module scope
- Extracted `wrap()` utility to module scope

**Files:**
- `src/components/ui/ScrollVelocity.tsx`

---

## 5. Content-Visibility and Lazy Loading for Instagram Feed

**Rule:** `rendering-content-visibility` — Use `content-visibility` for long lists

**Problem:** The Instagram feed renders up to 120 items (`DEFAULT_LIMIT = 120`), each with `<Image>` + overlay elements. All images used `loading="eager"`, and no paint optimization was applied, resulting in excessive DOM paint cost for off-screen items.

**Fix:**
- Added `content-visibility: auto` with `contain-intrinsic-size` on each feed item wrapper, allowing the browser to skip rendering of off-screen items
- Changed image loading from `eager` to `lazy` for items beyond the first 8 (first 2 rows in a 4-column grid)

```tsx
const feedItemStyle: React.CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 0px',
};
```

**Files:**
- `src/features/instagram/components/InstagramFeed.tsx`
- `src/features/instagram/components/FeedItem.tsx`

---

## 6. Replace Wildcard Barrel Re-exports

**Rule:** `bundle-barrel-imports` — Import directly, avoid barrel files

**Problem:** `guestbook/types/index.ts` used `export * from` (wildcard re-exports) across 4 files. This pattern prevents bundlers from statically analyzing which exports are used, making tree-shaking impossible.

**Fix:** Replaced all `export *` with explicit named exports.

```ts
// Before
export * from './entities';
export * from './types';
export * from './validation';
export * from './widget';

// After
export type { GuestbookItemDto, GuestbookPagination, ... } from './entities';
export { GUESTBOOK_PAGE_SIZE } from './entities';
export type { Texts, SubmissionText, ... } from './types';
export { schema } from './validation';
export type { EntriesText } from './widget';
```

**Files:**
- `src/features/guestbook/types/index.ts`

---

## 7. Stabilize Callback Dependencies in useTurnstile

**Rule:** `rerender-dependencies` — Use primitive dependencies in effects / `advanced-event-handler-refs`

**Problem:** `useTurnstile` used callback props (`onError`, `onSuccess`, etc.) directly in `useEffect` dependency arrays. When the parent passes inline functions, this causes:
1. The script-loading effect to re-run on every render (remounting the Turnstile script)
2. The widget-rendering effect to have stale or missing dependencies

**Fix:** Introduced a `useLatestRef` pattern to store callbacks in refs, keeping them always up-to-date without triggering effect re-runs. Added `theme` and `size` as proper dependencies for the render effect (since these are primitives that should trigger re-renders when changed).

```ts
function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// Callbacks accessed via refs in effects:
onSuccessRef.current?.(token);
```

**Files:**
- `src/lib/turnstile/lib/useTurnstile.ts`

---

## Rules That Passed Review

The following patterns were already well-implemented:

- **`async-parallel`** in `instagram/page.tsx` — `Promise.all([getInstagramPostList(), getInstagramProfile()])`
- **`async-parallel`** in `get-project-detail.ts` — `Promise.all([pages.retrieve, getBlockChildrenRecursive])`
- **`bundle-defer-third-party`** — `@vercel/analytics/next` auto-defers
- **`server-serialization`** — Server components pass minimal props to clients
- **`rerender-lazy-state-init`** — `useState(() => new QueryClient())`
- **`rerender-functional-setstate`** — Carousel navigation uses `setCurrentIndex(prev => ...)`
- **`rendering-hydration-suppress-warning`** — Applied on `<html>` and `<LocalDateTime>`
- **`js-set-map-lookups`** — `EMOTION_SET` uses `Set<EmotionCode>` for O(1) lookups

## Remaining Opportunities

These items were identified but not addressed in this round:

| Rule | Description | Notes |
|------|-------------|-------|
| `async-suspense` | Add inner `<Suspense>` boundaries | Would enable partial page streaming (e.g., Instagram profile vs feed) |
| `server-auth-actions` | Validate Turnstile token server-side | The guestbook `submit` action doesn't verify the token from the widget |
| `server-parallel-fetching` | N+1 in `get-project-list.ts` | Fetches all blocks then N page details sequentially per paginated item |
