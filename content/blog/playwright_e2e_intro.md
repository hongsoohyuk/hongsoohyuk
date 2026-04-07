---
title: "Playwright E2E 테스트 입문"
slug: "playwright_e2e_intro"
description: "Playwright를 활용한 E2E 테스트의 핵심 개념과 실전 설정 방법을 정리한 가이드. 테스트 피라미드, 인증 처리 전략, Locator Best Practices까지 다룹니다."
categories: ["Frontend", "Study", "Test"]
keywords: []
createdTime: "2026-02-23T07:34:55.893Z"
lastEditedTime: "2026-02-24T01:16:46.146Z"
---

## 왜 E2E 테스트인가?
프론트엔드 개발을 하다 보면 "잘 되던 기능이 갑자기 안 된다"는 상황을 자주 마주한다.

---

## 테스트 피라미드 이해하기

| 층위 | 도구 예시 | 속도 | 신뢰도 | 비용 |
| --- | --- | --- | --- | --- |
| **E2E** | Playwright, Cypress | 느림 | 높음 | 높음 |
| **통합/컴포넌트** | Testing Library, Vitest | 보통 | 보통 | 보통 |
| **단위** | Vitest, Jest | 빠름 | 낮음 | 낮음 |

> 💡 E2E 테스트는 "모든 것을 테스트하는 도구"가 아니다. **가장 중요한 Happy Path**를 보호하는 안전망이다.

---

## Playwright를 선택한 이유

### Cypress vs Playwright 비교

| 항목 | Cypress | Playwright |
| --- | --- | --- |
| 브라우저 지원 | Chrome 중심 | Chromium, Firefox, WebKit |
| 병렬 실행 | 유료(Cloud) | 내장 지원 |
| 멀티 탭/윈도우 | 미지원 | 지원 |
| 디버깅 도구 | Time Travel | Trace Viewer, UI Mode, Codegen |

---

## 프로젝트 설정

### 설치
```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

### 설정 파일
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 인증 처리 전략

### storageState 패턴

---

## Locator 전략 — 테스트의 안정성을 결정하는 핵심

> ✅ **Locator 우선순위**: `getByRole` > `getByLabel` > `getByText` > `getByPlaceholder` > `getByTestId`

---

## 디버깅 도구 활용

### UI Mode
```bash
npx playwright test --ui
```

### Trace Viewer

### Codegen
```bash
npx playwright codegen http://localhost:3000
```

---

## 자주 하는 실수와 안티패턴

---

## Custom Fixture로 테스트 확장하기

---

## 마치며
시작할 때 추천하는 접근법:
1. 가장 중요한 사용자 흐름 1-2개만 먼저 테스트한다
2. `storageState`로 인증을 한 번에 해결한다
3. `getByRole` 중심의 안정적인 Locator를 사용한다
4. UI Mode와 Trace Viewer를 적극 활용한다
