# 테스트 온보딩 가이드

> 프론트엔드 테스트가 처음인 개발자를 위한 학습 문서

## 목차

1. [왜 테스트를 작성하는가?](#1-왜-테스트를-작성하는가)
2. [이 프로젝트의 테스트 도구](#2-이-프로젝트의-테스트-도구)
3. [Jest 단위 테스트 기초](#3-jest-단위-테스트-기초)
4. [React 컴포넌트 테스트](#4-react-컴포넌트-테스트)
5. [커스텀 훅 테스트](#5-커스텀-훅-테스트)
6. [API 함수 테스트 (Mock 활용)](#6-api-함수-테스트-mock-활용)
7. [Playwright E2E 테스트 기초](#7-playwright-e2e-테스트-기초)
8. [테스트 실행 방법](#8-테스트-실행-방법)
9. [자주 하는 실수와 해결법](#9-자주-하는-실수와-해결법)

---

## 1. 왜 테스트를 작성하는가?

- **회귀 방지**: 코드를 수정했을 때 기존 기능이 깨지는 것을 빠르게 감지
- **리팩터링 안전망**: 테스트가 있으면 내부 구현을 자신 있게 변경 가능
- **명세 역할**: 테스트 코드 자체가 "이 함수는 이렇게 동작해야 한다"는 문서
- **디버깅 시간 절약**: 브라우저를 열지 않고도 로직 검증 가능

### 단위 테스트 vs E2E 테스트

| | 단위 테스트 (Jest) | E2E 테스트 (Playwright) |
|---|---|---|
| **범위** | 함수, 컴포넌트 하나 | 실제 브라우저에서 전체 페이지 |
| **속도** | 매우 빠름 (수 ms) | 느림 (수 초) |
| **목적** | 로직이 올바른지 검증 | 사용자 시나리오가 동작하는지 검증 |
| **외부 의존성** | Mock으로 격리 | 실제 서버 필요 |
| **실행 환경** | Node.js (jsdom) | 실제 Chromium 브라우저 |

---

## 2. 이 프로젝트의 테스트 도구

### 단위/컴포넌트 테스트
- **Jest** (v30) — 테스트 러너, assertion, mock 프레임워크
- **React Testing Library** — React 컴포넌트를 렌더링하고 DOM을 쿼리
- **@testing-library/jest-dom** — `toBeInTheDocument()` 같은 DOM 전용 매처

### E2E 테스트
- **Playwright** (v1.58) — 실제 브라우저를 자동화하는 E2E 프레임워크

### 설정 파일

```
/
├── jest.config.mjs          # Jest 설정 (테스트 패턴, 모듈 별칭, 커버리지)
├── jest.setup.ts            # Jest 전역 Mock 설정 (next-intl, next/navigation 등)
├── playwright.config.ts     # Playwright 설정 (브라우저, 타임아웃, 개발서버)
```

---

## 3. Jest 단위 테스트 기초

### 첫 번째 테스트 작성하기

가장 간단한 형태의 테스트부터 시작합니다.

**테스트 대상** — `src/utils/number.ts`:
```ts
export function parsePositiveInt(value: string | string[] | undefined | null): number | null {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}
```

**테스트 코드** — `src/utils/__tests__/number.test.ts`:
```ts
import {parsePositiveInt} from '../number';

describe('parsePositiveInt', () => {
  // 정상 케이스
  it('parses a positive integer string', () => {
    expect(parsePositiveInt('5')).toBe(5);
  });

  // 경계값 테스트
  it('returns null for "0"', () => {
    expect(parsePositiveInt('0')).toBeNull();
  });

  // 잘못된 입력 처리
  it('returns null for undefined', () => {
    expect(parsePositiveInt(undefined)).toBeNull();
  });

  // 배열 입력 처리
  it('uses first element when given an array', () => {
    expect(parsePositiveInt(['3', '7'])).toBe(3);
  });
});
```

### 핵심 개념 설명

| 개념 | 설명 | 예시 |
|------|------|------|
| `describe` | 관련 테스트를 그룹으로 묶음 | `describe('parsePositiveInt', () => { ... })` |
| `it` / `test` | 하나의 테스트 케이스 | `it('returns null for "0"', () => { ... })` |
| `expect` | 값에 대한 기대 조건을 설정 | `expect(result).toBe(5)` |
| `toBe` | 값이 정확히 같은지 (`===`) | `expect(1 + 1).toBe(2)` |
| `toEqual` | 객체/배열의 깊은 비교 | `expect({a: 1}).toEqual({a: 1})` |
| `toBeNull` | null인지 확인 | `expect(null).toBeNull()` |
| `toBeInTheDocument` | DOM에 존재하는지 확인 (RTL 전용) | `expect(screen.getByText('Hi')).toBeInTheDocument()` |

### 테스트 파일 위치 규칙

이 프로젝트에서 테스트 파일은 `__tests__/` 디렉토리에 위치합니다:

```
src/features/guestbook/
├── api/
│   └── actions.ts
├── emotion/
│   └── validation.ts
├── __tests__/              ← 테스트는 여기에
│   ├── actions.test.ts
│   └── emotion-validation.test.ts
```

파일명 규칙: `{테스트대상}.test.ts` 또는 `{테스트대상}.test.tsx` (JSX 포함 시)

---

## 4. React 컴포넌트 테스트

컴포넌트 테스트의 핵심 원칙: **사용자가 보는 것을 기준으로 테스트한다.**

### 기본 패턴: render → query → assert

**테스트 대상** — `ProjectCard.tsx`:
```tsx
export function ProjectCard({project}: Props) {
  return (
    <Link href={`/project/${project.slug}`}>
      <h3>{project.title}</h3>
      <LocalDateTime date={project.createdTime} />
    </Link>
  );
}
```

**테스트 코드** — `ProjectCard.test.tsx`:
```tsx
import {render, screen} from '@testing-library/react';
import {ProjectCard} from '../components/ProjectCard';

// 외부 의존성은 Mock으로 대체
jest.mock('@/lib/i18n/routing', () => ({
  Link: ({href, children}: {href: string; children: React.ReactNode}) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ProjectCard', () => {
  const mockProject = {
    id: '123',
    slug: 'abc123',
    title: 'My Project',
    createdTime: '2024-01-15T10:00:00Z',
  };

  it('renders project title', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('links to project detail page', () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/project/abc123');
  });
});
```

### DOM 쿼리 우선순위

React Testing Library는 접근성 기반 쿼리를 권장합니다:

```
1순위:  screen.getByRole('button')        ← 역할(role) 기반 (가장 권장)
2순위:  screen.getByText('제출')           ← 텍스트 기반
3순위:  screen.getByTestId('submit-btn')   ← data-testid 기반 (최후의 수단)
```

### 자주 쓰는 쿼리 메서드

| 메서드 | 없으면? | 용도 |
|--------|---------|------|
| `getByRole` | 에러 발생 | 요소가 반드시 있어야 할 때 |
| `getByText` | 에러 발생 | 텍스트로 요소 찾을 때 |
| `queryByRole` | `null` 반환 | 요소가 없어야 함을 확인할 때 |
| `findByRole` | Promise | 비동기로 나타나는 요소를 기다릴 때 |

### 존재하지 않아야 할 요소 확인

```tsx
// ✅ queryBy를 사용해서 null 확인
expect(screen.queryByRole('img')).not.toBeInTheDocument();

// ❌ getBy는 없으면 에러가 발생하므로 "없음" 테스트에 사용 불가
expect(screen.getByRole('img')).not.toBeInTheDocument(); // 에러!
```

---

## 5. 커스텀 훅 테스트

커스텀 훅은 컴포넌트 안에서만 실행 가능하므로 `renderHook`을 사용합니다.

**테스트 대상** — `useDialogController.ts`:
```ts
export function useDialogController(initialOpen?: boolean) {
  const [state, setState] = useState(initialOpen ?? false);
  const open = useCallback(() => setState(true), []);
  const close = useCallback(() => setState(false), []);
  return {open, close, isOpen: state};
}
```

**테스트 코드**:
```ts
import {renderHook, act} from '@testing-library/react';
import {useDialogController} from '../useDialogController';

describe('useDialogController', () => {
  it('starts closed by default', () => {
    const {result} = renderHook(() => useDialogController());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens the dialog', () => {
    const {result} = renderHook(() => useDialogController());

    // 상태를 변경하는 동작은 반드시 act()로 감싸야 함
    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('open 함수는 리렌더 후에도 같은 참조 (useCallback)', () => {
    const {result, rerender} = renderHook(() => useDialogController());
    const firstOpen = result.current.open;
    rerender();
    expect(result.current.open).toBe(firstOpen);
  });
});
```

### 핵심 포인트

- `renderHook(() => useMyHook())` — 훅을 격리된 환경에서 실행
- `result.current` — 훅의 현재 반환값에 접근
- `act(() => { ... })` — 상태 업데이트를 일으키는 코드를 감싸야 함
- `rerender()` — 컴포넌트 리렌더를 시뮬레이션

---

## 6. API 함수 테스트 (Mock 활용)

API 함수는 외부 서비스(Notion, Supabase 등)에 의존하므로 **Mock**으로 격리합니다.

### jest.mock() 기본 패턴

```ts
// 1. 모듈을 Mock으로 교체 (import보다 먼저 실행됨)
jest.mock('@/lib/api/notion', () => ({
  notion: {
    pages: { retrieve: jest.fn() },
    blocks: { children: { list: jest.fn() } },
  },
}));

// 2. Mock된 모듈을 import
import {notion} from '@/lib/api/notion';

// 3. 타입 캐스팅으로 Mock 함수에 접근
const mockRetrieve = notion.pages.retrieve as jest.Mock;

// 4. 테스트에서 반환값 설정
it('fetches page data', async () => {
  mockRetrieve.mockResolvedValue({id: 'page-1', properties: {...}});

  const result = await getProjectDetail('page-1');

  expect(result.meta.id).toBe('page-1');
  expect(mockRetrieve).toHaveBeenCalledWith({page_id: 'page-1'});
});
```

### 실제 예시: 블로그 리스트 API

```ts
jest.mock('@/lib/api/notion', () => ({
  notion: {
    dataSources: { query: jest.fn() },
    blocks: { children: { list: jest.fn() } },
  },
}));

import {getBlogList} from '../api/get-blog-list';
import {notion} from '@/lib/api/notion';

const mockQuery = notion.dataSources.query as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();  // 매 테스트 전에 Mock 초기화
});

describe('getBlogList', () => {
  it('passes search query filter', async () => {
    mockQuery.mockResolvedValue({results: []});

    await getBlogList({q: 'react'});

    // Mock이 어떤 인자로 호출됐는지 검증
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {property: 'Doc name', title: {contains: 'react'}},
      }),
    );
  });
});
```

### Mock 메서드 요약

| 메서드 | 용도 |
|--------|------|
| `jest.fn()` | 빈 Mock 함수 생성 |
| `.mockReturnValue(val)` | 동기 반환값 설정 |
| `.mockResolvedValue(val)` | `Promise.resolve(val)` 반환 (async 함수) |
| `.mockRejectedValue(err)` | `Promise.reject(err)` 반환 (에러 시뮬레이션) |
| `.mockReturnValueOnce(val)` | 한 번만 반환 (순차적 다른 응답) |
| `jest.clearAllMocks()` | 모든 Mock의 호출 기록 초기화 |
| `expect(fn).toHaveBeenCalledWith(arg)` | 특정 인자로 호출됐는지 검증 |

---

## 7. Playwright E2E 테스트 기초

E2E 테스트는 **실제 브라우저**에서 사용자 시나리오를 재현합니다.

### 파일 위치

```
e2e/
├── project-list.spec.ts     # 프로젝트 목록 페이지
└── project-detail.spec.ts   # 프로젝트 상세 페이지
```

### 기본 구조

```ts
import {expect, test} from '@playwright/test';

test.describe('Project List Page', () => {
  // 각 테스트 전에 페이지 이동
  test.beforeEach(async ({page}) => {
    await page.goto('/project');
  });

  test('displays page title', async ({page}) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('project cards navigate to detail', async ({page}) => {
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('[class*="grid"] a').first();
    await firstCard.click();
    await page.waitForURL(/\/project\/[a-z0-9]+/);

    expect(page.url()).toContain('/project/');
  });
});
```

### Jest vs Playwright 비교

| Jest (단위) | Playwright (E2E) |
|-------------|------------------|
| `render(<Comp />)` | `await page.goto('/path')` |
| `screen.getByRole('button')` | `page.getByRole('button')` |
| `expect(el).toBeInTheDocument()` | `await expect(locator).toBeVisible()` |
| 동기 (`expect(x).toBe(y)`) | **비동기** (`await expect(loc).toBeVisible()`) |
| `jest.fn()` 으로 Mock | 실제 서버에 요청 |

### 모바일 테스트

```ts
test.describe('Mobile View', () => {
  test.use({viewport: {width: 375, height: 667}});

  test('displays correctly on mobile', async ({page}) => {
    await page.goto('/project');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### 다국어(i18n) 테스트

```ts
test('displays Korean content', async ({page}) => {
  await page.goto('/project');           // 기본 한국어
  await expect(page).toHaveTitle(/.+/);
});

test('displays English content', async ({page}) => {
  await page.goto('/en/project');        // 영어
  await expect(page).toHaveTitle(/.+/);
});
```

---

## 8. 테스트 실행 방법

### 단위 테스트 (Jest)

```bash
# 전체 실행
pnpm test

# 특정 파일만 실행
pnpm test -- src/utils/__tests__/number.test.ts

# 특정 패턴 매칭
pnpm test -- --testPathPattern="guestbook"

# Watch 모드 (파일 수정 시 자동 재실행)
pnpm test:watch

# 커버리지 리포트 생성
pnpm test:coverage
```

### E2E 테스트 (Playwright)

```bash
# 전체 실행 (헤드리스)
pnpm test:e2e

# UI 모드 (브라우저에서 인터랙티브하게 실행)
pnpm test:e2e:ui

# 브라우저가 보이는 모드
pnpm test:e2e:headed

# 특정 파일만 실행
npx playwright test e2e/project-list.spec.ts

# 실패한 테스트의 스크린샷 확인
npx playwright show-report
```

> **참고**: E2E 테스트는 개발 서버가 필요합니다. Playwright가 자동으로 `pnpm dev --port 3003`을 실행합니다.

---

## 9. 자주 하는 실수와 해결법

### "Not wrapped in act(...)" 경고

```
Warning: An update was not wrapped in act(...)
```

**원인**: 상태 업데이트가 `act()` 밖에서 발생

**해결**:
```ts
// ❌
result.current.open();

// ✅
act(() => {
  result.current.open();
});
```

### Mock이 작동하지 않음

**원인**: `jest.mock()`이 import보다 뒤에 위치

```ts
// ❌ 순서가 잘못됨
import {getBlogList} from '../api/get-blog-list';
jest.mock('@/lib/api/notion', () => ({...}));

// ✅ jest.mock은 항상 import 위에 (Jest가 자동으로 호이스팅하지만 명시적으로)
jest.mock('@/lib/api/notion', () => ({...}));
import {getBlogList} from '../api/get-blog-list';
```

### "useFormatter is not a function"

**원인**: `jest.setup.ts`에서 Mock이 불완전

**해결**: `jest.setup.ts`의 전역 Mock을 확인하고 누락된 함수를 추가. 현재 설정:
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

### 비동기 테스트에서 에러가 무시됨

```ts
// ❌ Promise를 await하지 않으면 에러가 감지 안 됨
it('throws error', () => {
  expect(fetchData()).rejects.toThrow();
});

// ✅ 반드시 await 추가
it('throws error', async () => {
  await expect(fetchData()).rejects.toThrow('error message');
});
```

### E2E 테스트가 flaky (불안정)

```ts
// ❌ 하드코딩된 대기
await page.waitForTimeout(3000);

// ✅ 조건부 대기
await page.waitForLoadState('networkidle');
await expect(page.locator('h1')).toBeVisible();
```

---

## 다음 단계

이 가이드를 읽고 나서 추천하는 학습 순서:

1. `src/utils/__tests__/number.test.ts` — 가장 간단한 순수 함수 테스트
2. `src/features/guestbook/__tests__/emotion-validation.test.ts` — 비즈니스 로직 테스트
3. `src/features/project/__tests__/ProjectCard.test.tsx` — 컴포넌트 테스트
4. `src/hooks/__tests__/useDialogController.test.ts` — 훅 테스트
5. `src/features/blog/__tests__/get-blog-list.test.ts` — Mock을 활용한 API 테스트
6. `e2e/project-list.spec.ts` — E2E 테스트

각 파일을 읽고, 한 줄씩 이해한 뒤, 비슷한 패턴으로 직접 테스트를 추가해 보세요.
