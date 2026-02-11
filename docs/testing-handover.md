# 테스트 코드 인수인계 문서

> 신입 프론트엔드 개발자를 위한 테스트 코드 현황, 가이드라인, 실행 방법

## 목차

1. [현재 테스트 커버리지 현황](#1-현재-테스트-커버리지-현황)
2. [테스트 파일 전체 목록](#2-테스트-파일-전체-목록)
3. [영역별 커버리지 상세](#3-영역별-커버리지-상세)
4. [테스트 작성 기준](#4-테스트-작성-기준)
5. [새 테스트를 추가할 때](#5-새-테스트를-추가할-때)
6. [테스트 실행 및 커버리지 확인](#6-테스트-실행-및-커버리지-확인)
7. [전역 Mock 설정 (jest.setup.ts)](#7-전역-mock-설정-jestsetupts)
8. [커버리지 기준선 (Threshold)](#8-커버리지-기준선-threshold)
9. [앞으로 추가해야 할 테스트](#9-앞으로-추가해야-할-테스트)

---

## 1. 현재 테스트 커버리지 현황

| 지표 | 수치 |
|------|------|
| **Statements** | 36.94% |
| **Branches** | 37.02% |
| **Functions** | 28.99% |
| **Lines** | 37.36% |
| **테스트 파일** | 26개 (단위 26 + E2E 2) |
| **테스트 케이스** | 228개 (전체 통과) |

---

## 2. 테스트 파일 전체 목록

### 단위/컴포넌트 테스트 (Jest)

#### Utils (공유 유틸리티)
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `src/utils/__tests__/date.test.ts` | `formatDate`, `formatDateTime`, `truncateText`, `isValidEmail` | 14 |
| `src/utils/__tests__/number.test.ts` | `parsePositiveInt` | 12 |
| `src/utils/__tests__/style.test.ts` | `cn` (Tailwind 클래스 병합) | 6 |

#### Project 기능
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `src/features/project/__tests__/NotionBlocks.test.tsx` | Notion 블록 타입별 렌더링 (paragraph, heading, quote, code, image, etc.) | 15 |
| `src/features/project/__tests__/NotionRichText.test.tsx` | Notion 리치 텍스트 포맷 (bold, italic, link, code, etc.) | 12 |
| `src/features/project/__tests__/ProjectCard.test.tsx` | ProjectCard 컴포넌트 렌더링, 링크 | 5 |
| `src/features/project/__tests__/get-project-detail.test.ts` | 프로젝트 상세 API (slug 변환, 병렬 패칭, 에러 처리) | 7 |
| `src/features/project/__tests__/get-project-list.test.ts` | 프로젝트 리스트 API (페이지네이션, 필터링, 기본값) | 8 |

#### Guestbook 기능
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `src/features/guestbook/__tests__/emotion-validation.test.ts` | `toggleEmotion`, `isValidEmotionSet` (감정 선택 로직) | 12 |
| `src/features/guestbook/__tests__/emotion-type.test.ts` | `normalizeGuestbookEmotions` (감정 코드 정규화) | 9 |
| `src/features/guestbook/__tests__/form-validation.test.ts` | Zod 폼 스키마 (author_name, message, emotions 검증) | 12 |
| `src/features/guestbook/__tests__/actions.test.ts` | 서버 액션 (제출, 유효성 검사, Supabase 삽입, 에러 처리) | 8 |

#### Blog 기능
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `src/features/blog/__tests__/get-blog-list.test.ts` | 블로그 리스트 (필터, 검색, 카테고리, 발췌문 추출) | 9 |
| `src/features/blog/__tests__/get-blog-detail.test.ts` | 블로그 상세 (slug 변환, 병렬 패칭, 카테고리) | 6 |

#### Instagram 기능
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `src/features/instagram/__tests__/list-post.test.ts` | 인스타그램 피드 (정적 JSON, Origin API 호출) | 5 |
| `src/features/instagram/__tests__/get-profile.test.ts` | 인스타그램 프로필 (정적 JSON, Origin API 호출) | 4 |
| `src/features/instagram/__tests__/local.test.ts` | `readInstagramStaticJson` (파일 읽기, 에러 처리) | 3 |
| `src/features/instagram/__tests__/query-key-factory.test.ts` | React Query 키 팩토리 | 5 |

#### 공유 Hooks
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `src/hooks/__tests__/useDialogController.test.ts` | 다이얼로그 open/close 상태 관리 | 7 |
| `src/hooks/__tests__/use-dom-ready.test.ts` | SSR-safe DOM 준비 상태 | 1 |
| `src/hooks/__tests__/use-dark-mode.test.ts` | 다크모드 감지 (next-themes 연동) | 3 |
| `src/hooks/__tests__/use-intersection-observer.test.ts` | IntersectionObserver 래퍼 | 3 |

#### 공유 라이브러리
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `src/lib/api/__tests__/http.test.ts` | HttpClient (URL 빌딩, 재시도, 타임아웃, 에러 처리) | 22 |
| `src/lib/api/__tests__/notion-blocks.test.ts` | Notion 블록 재귀 조회 | 5 |
| `src/lib/security/__tests__/client-fingerprint.test.ts` | HMAC 핑거프린팅 (IP/UA 해싱) | 6 |
| `src/lib/turnstile/__tests__/useTurnstile.test.ts` | Cloudflare Turnstile CAPTCHA 훅 | 9 |

### E2E 테스트 (Playwright)
| 테스트 파일 | 테스트 대상 | 테스트 수 |
|-------------|------------|-----------|
| `e2e/project-list.spec.ts` | 프로젝트 목록 페이지 (레이아웃, 카드, 페이지네이션, 모바일, i18n) | 7 |
| `e2e/project-detail.spec.ts` | 프로젝트 상세 페이지 (네비게이션, 블록 렌더링, 모바일, 이미지, 코드블록) | 8 |

---

## 3. 영역별 커버리지 상세

### 커버가 된 영역

| 영역 | 커버 범위 | 비고 |
|------|-----------|------|
| `src/utils/` | date, number, style 전체 | 순수 함수 100% |
| `src/features/project/` | API 2개, 컴포넌트 3개 | 가장 높은 커버리지 |
| `src/features/guestbook/` | 폼 유효성검사, 감정 로직, 서버 액션 | 컴포넌트 미포함 |
| `src/features/blog/` | API 2개 (리스트, 상세) | 컴포넌트 미포함 |
| `src/features/instagram/` | API 전체, 쿼리 키 팩토리 | 컴포넌트 미포함 |
| `src/hooks/` | 4개 훅 전체 | |
| `src/lib/api/` | HttpClient, notion-blocks | |
| `src/lib/security/` | client-fingerprint | |
| `src/lib/turnstile/` | useTurnstile 훅 | Turnstile 컴포넌트 미포함 |

### 커버가 안 된 영역 (0% 테스트)

| 영역 | 파일 수 | 우선순위 | 이유 |
|------|---------|----------|------|
| `src/features/guestbook/components/` | 7개 | **높음** | 사용자 입력 폼, 다이얼로그 — 사용자와 직접 인터랙션 |
| `src/features/blog/components/` | 3개 | 중간 | BlogSearchFilter에 클라이언트 로직 존재 |
| `src/features/instagram/components/` | 7개 | 중간 | PostMediaViewer(139줄)에 캐러셀 로직 |
| `src/features/home/components/` | 1개 | 낮음 | 단순 UI |
| `src/features/resume/` | 3개 | 낮음 | API 1개 + 설정 |
| `src/components/ui/` | 35개 | 낮음 | Radix UI 래퍼로 대부분 단순 |
| `src/components/layout/` | 3개 | 낮음 | 레이아웃 컴포넌트 |
| `src/app/providers/` | 3개 | 낮음 | Provider 설정 |
| `src/lib/i18n/` | 3개 | 낮음 | 설정 파일 |
| E2E: 방명록, 블로그, 인스타그램 | - | **높음** | 사용자 시나리오 부재 |

---

## 4. 테스트 작성 기준

### 반드시 테스트가 있어야 하는 코드

| 유형 | 이유 | 예시 |
|------|------|------|
| **유효성 검사 로직** | 잘못된 데이터가 DB에 들어가는 것을 방지 | Zod 스키마, `isValidEmail`, `isValidEmotionSet` |
| **서버 액션** | 데이터 쓰기 경로 — 버그 시 DB 오염 | `guestbook/actions.ts` |
| **비즈니스 로직** | 도메인 규칙이 정확히 구현되었는지 보장 | `toggleEmotion`, `parsePositiveInt` |
| **데이터 변환 함수** | 입/출력이 명확한 순수 함수 | `formatDate`, `slugToPageId`, `extractTitle` |
| **HTTP 클라이언트** | 재시도, 타임아웃, 에러 분류 | `HttpClient` |
| **보안 관련 코드** | 해싱, 인증 로직의 정확성 | `getClientFingerprint` |

### 테스트를 생략해도 되는 코드

| 유형 | 이유 |
|------|------|
| 타입 정의 파일 (`.d.ts`, `types/`) | 런타임에 존재하지 않음 |
| barrel export (`index.ts`) | re-export만 수행 |
| 설정 상수 (`config/constant.ts`) | 단순 값 정의 |
| Radix UI 래퍼 (`components/ui/button.tsx` 등) | 라이브러리가 이미 테스트됨 |

### 테스트 하나가 검증해야 할 범위

```
하나의 it() 블록 = 하나의 동작(behavior)
```

```ts
// ✅ 좋은 예: 한 가지 동작만 검증
it('returns null for "0"', () => {
  expect(parsePositiveInt('0')).toBeNull();
});

// ❌ 나쁜 예: 여러 동작을 한 테스트에 몰아넣음
it('handles various inputs', () => {
  expect(parsePositiveInt('0')).toBeNull();
  expect(parsePositiveInt('-1')).toBeNull();
  expect(parsePositiveInt('abc')).toBeNull();
  expect(parsePositiveInt('5')).toBe(5);
});
```

### 테스트 네이밍 규칙

```ts
// describe: 테스트 대상 (함수명 또는 컴포넌트명)
describe('parsePositiveInt', () => {

  // it: "it + 동사구" = 영어로 자연스러운 문장
  it('parses a positive integer string', ...);
  it('returns null for undefined', ...);
  it('uses first element when given an array', ...);
});
```

### 테스트 구조: AAA 패턴

모든 테스트는 세 단계로 구성합니다:

```ts
it('submits successfully with valid data', async () => {
  // Arrange (준비) — Mock 설정, 테스트 데이터 생성
  mockFrom.mockReturnValue({
    insert: jest.fn().mockResolvedValue({error: null}),
  });
  const fd = createFormData({author_name: 'Alice', message: 'Hi!'});

  // Act (실행) — 테스트 대상 함수 호출
  const result = await submit(prevState, fd);

  // Assert (검증) — 기대 결과 확인
  expect(result.status).toBe('success');
});
```

---

## 5. 새 테스트를 추가할 때

### 파일 생성 위치

```
src/features/{feature-name}/__tests__/{대상파일명}.test.ts(x)
src/hooks/__tests__/{훅이름}.test.ts
src/utils/__tests__/{유틸이름}.test.ts
src/lib/{모듈}/__tests__/{파일명}.test.ts
```

### 체크리스트

새 테스트 파일을 작성할 때 다음을 확인하세요:

- [ ] `__tests__/` 디렉토리에 파일 생성
- [ ] 파일명이 `.test.ts` 또는 `.test.tsx`로 끝나는지
- [ ] 외부 의존성(`@/lib/api/notion` 등)은 `jest.mock()`으로 격리
- [ ] `beforeEach`에서 `jest.clearAllMocks()` 호출
- [ ] 정상 케이스 + 에러 케이스 + 경계값 테스트 포함
- [ ] `pnpm test -- 해당파일경로`로 단독 실행하여 통과 확인
- [ ] `pnpm test:coverage`로 커버리지 기준선 통과 확인

### 기능별 새 테스트 작성 템플릿

#### 순수 함수

```ts
import {myFunction} from '../my-module';

describe('myFunction', () => {
  it('정상 입력 처리', () => {
    expect(myFunction('valid')).toBe('expected');
  });

  it('빈 입력 처리', () => {
    expect(myFunction('')).toBe('fallback');
  });

  it('에러 케이스', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

#### API 함수 (Mock 필요)

```ts
jest.mock('@/lib/api/notion', () => ({
  notion: { /* 필요한 메서드만 Mock */ },
}));

import {myApiFunction} from '../api/my-api';
import {notion} from '@/lib/api/notion';

const mockMethod = notion.someMethod as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('myApiFunction', () => {
  it('returns data on success', async () => {
    mockMethod.mockResolvedValue({results: [...]});
    const result = await myApiFunction();
    expect(result).toEqual({...});
  });

  it('handles API error', async () => {
    mockMethod.mockRejectedValue(new Error('API error'));
    await expect(myApiFunction()).rejects.toThrow('API error');
  });
});
```

#### 컴포넌트

```tsx
import {render, screen} from '@testing-library/react';
import {MyComponent} from '../components/MyComponent';

// 필요한 의존성 Mock
jest.mock('@/lib/i18n/routing', () => ({
  Link: ({href, children}: any) => <a href={href}>{children}</a>,
}));

describe('MyComponent', () => {
  it('renders content', () => {
    render(<MyComponent data={mockData} />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

---

## 6. 테스트 실행 및 커버리지 확인

### 일상 명령어

```bash
# 단위 테스트 전체 실행
pnpm test

# 특정 기능 관련 테스트만 실행
pnpm test -- --testPathPattern="guestbook"
pnpm test -- --testPathPattern="blog"

# 특정 파일만 실행
pnpm test -- src/utils/__tests__/date.test.ts

# Watch 모드 (개발 중 실시간 실행)
pnpm test:watch

# 커버리지 리포트 생성
pnpm test:coverage

# E2E 테스트 (개발 서버 자동 시작)
pnpm test:e2e

# E2E UI 모드 (디버깅에 유용)
pnpm test:e2e:ui
```

### 커버리지 리포트 읽는 법

`pnpm test:coverage` 실행 후 출력 예시:

```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
features/guestbook/emotion   |   75.00 |   100.00 |   66.67 |   80.00 |
  validation.ts              |     100 |      100 |     100 |     100 | ← 완벽
  type.ts                    |   50.00 |    50.00 |   33.33 |   60.00 | ← 개선 필요
```

- **Stmts**: 실행된 코드 라인 비율
- **Branch**: if/else, 삼항 연산자 등의 분기 커버 비율
- **Funcs**: 호출된 함수 비율
- **Lines**: 실행된 물리적 라인 비율

마지막 컬럼에 `19-21,26-29` 같은 숫자가 나오면 해당 줄이 테스트에서 실행되지 않았다는 뜻입니다.

---

## 7. 전역 Mock 설정 (jest.setup.ts)

모든 테스트에 자동 적용되는 전역 Mock이 `jest.setup.ts`에 설정되어 있습니다:

| Mock 대상 | 설명 |
|-----------|------|
| `next-intl` → `useTranslations` | 번역 함수를 키 반환 함수로 대체 |
| `next-intl` → `useFormatter` | 날짜/숫자 포맷터를 ISO 문자열 반환으로 대체 |
| `next-intl/server` → `getTranslations` | 서버 측 번역 함수 Mock |
| `next-intl/server` → `setRequestLocale` | no-op |
| `next-themes` → `useTheme` | 기본 라이트 테마 반환 |
| `next/navigation` → `useRouter` | `push`, `replace`, `back` Mock |
| `next/navigation` → `useSearchParams` | 빈 URLSearchParams 반환 |
| `next/navigation` → `usePathname` | `'/'` 반환 |

**새로운 Next.js 훅을 사용하는 컴포넌트를 테스트할 때**, 전역 Mock에 없으면 `jest.setup.ts`에 추가하거나 테스트 파일 내에서 `jest.mock()`으로 오버라이드하세요.

---

## 8. 커버리지 기준선 (Threshold)

`jest.config.mjs`에 다음 기준선이 설정되어 있습니다:

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

이 기준선 이하로 커버리지가 떨어지면 `pnpm test:coverage`가 **실패**합니다.

### 기준선 인상 계획

| 시점 | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| **현재** | 30% | 25% | 25% | 30% |
| 컴포넌트 테스트 추가 후 | 45% | 40% | 40% | 45% |
| E2E 확장 후 (최종 목표) | 60% | 50% | 50% | 60% |

기준선은 커버리지가 충분히 올라간 후에 `jest.config.mjs`에서 상향 조정합니다.

---

## 9. 앞으로 추가해야 할 테스트

### 1순위: 방명록 컴포넌트 테스트

방명록은 사용자 입력을 받는 유일한 기능이므로 컴포넌트 테스트가 가장 시급합니다.

| 대상 | 테스트할 내용 |
|------|---------------|
| `GuestbookFormDialog.tsx` | 폼 제출 시 유효성 검사 에러 표시, 성공 시 다이얼로그 닫힘, 감정 선택 UI |
| `GuestbookList.tsx` | 리스트 렌더링, 빈 리스트 처리 |
| `EmotionButtonGroup.tsx` | 감정 버튼 토글, 최대 2개 제한 UI 반영 |
| `GuestbookDetailDialog.tsx` | 방명록 상세 다이얼로그 열기/닫기 |

### 2순위: 블로그/인스타그램 컴포넌트 테스트

| 대상 | 테스트할 내용 |
|------|---------------|
| `BlogSearchFilter.tsx` | 검색어 입력, 카테고리 필터 변경, URL 파라미터 반영 |
| `PostMediaViewer.tsx` | 이미지/비디오/캐러셀 타입별 렌더링, 슬라이드 전환 |
| `ProfileCard.tsx` | 프로필 데이터 렌더링 |

### 3순위: E2E 테스트 확장

| 대상 페이지 | 시나리오 |
|-------------|----------|
| `/guestbook` | 방명록 작성 → 제출 → 리스트에 표시 확인 |
| `/blog` | 블로그 목록 → 검색 → 카테고리 필터 → 상세 페이지 이동 |
| `/instagram` | 피드 로딩 → 무한스크롤 → 포스트 상세 보기 |
| `/resume` | 페이지 로딩 → 콘텐츠 렌더링 |

### 4순위: 나머지

| 대상 | 비고 |
|------|------|
| `src/lib/turnstile/ui/Turnstile.tsx` | Turnstile 위젯 컴포넌트 렌더링 |
| `src/app/providers/` | QueryProvider, ThemeProvider 초기화 |
| `src/components/layout/` | Header, Footer 내비게이션 |

---

## 참고: 프로젝트 테스트 디렉토리 구조

```
/
├── jest.config.mjs              # Jest 설정
├── jest.setup.ts                # 전역 Mock
├── playwright.config.ts         # E2E 설정
│
├── e2e/                         # E2E 테스트
│   ├── project-list.spec.ts
│   └── project-detail.spec.ts
│
└── src/
    ├── utils/__tests__/         # 유틸리티 테스트
    │   ├── date.test.ts
    │   ├── number.test.ts
    │   └── style.test.ts
    │
    ├── hooks/__tests__/         # 공유 훅 테스트
    │   ├── useDialogController.test.ts
    │   ├── use-dom-ready.test.ts
    │   ├── use-dark-mode.test.ts
    │   └── use-intersection-observer.test.ts
    │
    ├── lib/
    │   ├── api/__tests__/       # API 인프라 테스트
    │   │   ├── http.test.ts
    │   │   └── notion-blocks.test.ts
    │   ├── security/__tests__/
    │   │   └── client-fingerprint.test.ts
    │   └── turnstile/__tests__/
    │       └── useTurnstile.test.ts
    │
    └── features/
        ├── project/__tests__/   # 프로젝트 기능 테스트
        │   ├── NotionBlocks.test.tsx
        │   ├── NotionRichText.test.tsx
        │   ├── ProjectCard.test.tsx
        │   ├── get-project-detail.test.ts
        │   └── get-project-list.test.ts
        │
        ├── guestbook/__tests__/ # 방명록 기능 테스트
        │   ├── actions.test.ts
        │   ├── emotion-type.test.ts
        │   ├── emotion-validation.test.ts
        │   └── form-validation.test.ts
        │
        ├── blog/__tests__/      # 블로그 기능 테스트
        │   ├── get-blog-list.test.ts
        │   └── get-blog-detail.test.ts
        │
        └── instagram/__tests__/ # 인스타그램 기능 테스트
            ├── list-post.test.ts
            ├── get-profile.test.ts
            ├── local.test.ts
            └── query-key-factory.test.ts
```
