---
title: "E2E 테스트 시나리오 선정 기준"
slug: "e2e_scenario_selection"
description: "E2E 테스트에서 가장 어려운 질문인 '무엇을 테스트할 것인가'에 대한 체계적인 기준을 제시합니다. 선정 원칙, 우선순위 매트릭스, 시나리오 유형별 분류까지."
categories: ["Frontend", "Test"]
keywords: []
createdTime: "2026-02-23T08:09:47.377Z"
lastEditedTime: "2026-02-24T01:16:36.208Z"
---

## "뭘 테스트해야 하지?"
Playwright를 설치하고, 설정 파일을 작성하고, 첫 번째 예제 테스트를 실행하는 것까지는 어렵지 않다. 진짜 어려운 건 그 다음이다.

**"어떤 시나리오를 E2E로 테스트해야 하지?"**

이 질문에 답하지 못하면 두 가지 극단에 빠지게 된다:
- 모든 것을 E2E로 테스트하려다가 느리고 불안정한 테스트 스위트를 얻거나
- 뭘 테스트할지 몰라서 예제 테스트 하나만 남겨둔 채 방치하거나

---

## 대원칙: 사용자 여정(User Journey) 중심
E2E 테스트의 핵심은 **사용자 관점**이다. 코드가 아닌, 사용자가 서비스에서 수행하는 **업무 흐름**을 기준으로 시나리오를 정한다.

```
GOOD: "대시보드에 진입하면 주요 지표가 표시된다"
GOOD: "목록에서 항목을 클릭하면 상세 정보가 나타난다"

BAD:  "API가 200을 반환한다" (→ API 테스트 영역)
BAD:  "버튼 색상이 파란색이다" (→ 시각적 회귀 테스트 영역)
```

---

## 선정 기준 체크리스트

### Must-Have: 반드시 테스트해야 하는 것

| 기준 | 설명 | 예시 |
| --- | --- | --- |
| **크리티컬 패스** | 이 기능이 깨지면 서비스를 사용할 수 없다 | 로그인, 메인 페이지 진입, 핵심 데이터 조회 |
| **멀티 페이지 흐름** | 2개 이상 페이지를 거치는 워크플로우 | 목록 → 상세 → 수정 → 저장 |
| **라우팅/네비게이션** | URL 변경, 리다이렉트, 가드 동작 | 잘못된 URL 접근 시 리다이렉트 |
| **인증/권한** | 인증 상태에 따른 접근 제어 | 미인증 시 로그인 페이지 리다이렉트 |

### Should-Have: 테스트하면 좋은 것

| 기준 | 설명 | 예시 |
| --- | --- | --- |
| **폼 제출 흐름** | 입력 → 유효성 검증 → API 호출 → 결과 확인 | 사용자 등록, 설정 변경 |
| **테이블 인터랙션** | 필터, 정렬, 페이지네이션의 실제 동작 | 데이터 테이블 필터링 후 결과 갱신 |
| **조건부 UI** | 사용자 역할, 설정에 따라 달라지는 UI | 관리자만 보이는 메뉴 |
| **에러/엣지 케이스** | 사용자가 흔히 마주하는 에러 상황 | 404 페이지, 빈 데이터 상태 |

---

## 시나리오 유형별 분류

### 유형 1: Smoke Test (연기 테스트)
**"모든 페이지가 최소한으로 동작하는가?"**

가장 기본적이면서 가장 가성비가 높은 테스트.
```typescript
const pages = [
  { path: '/dashboard', name: '대시보드' },
  { path: '/users', name: '사용자 관리' },
  { path: '/settings', name: '설정' },
]

for (const { path, name } of pages) {
  test(`${name} 페이지가 로드된다`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(path))
    await expect(page.getByRole('navigation')).toBeVisible()
  })
}
```

> Smoke Test는 **가장 먼저 작성해야 할 테스트**다. 5-10개의 Smoke Test만으로도 배포 후 치명적인 문제를 조기에 발견할 수 있다.

### 유형 2: Happy Path (정상 흐름)
**"핵심 업무 흐름이 정상 동작하는가?"**

### 유형 3: Navigation & Routing (네비게이션)
**"페이지 이동과 URL 라우팅이 정상 동작하는가?"**

### 유형 4: Form Workflow (폼 워크플로우)
**"폼 입력 → 유효성 검증 → 제출 → 결과 확인이 동작하는가?"**

### 유형 5: Guard & Permission (가드/권한)
**"접근 제어와 권한 체계가 올바르게 동작하는가?"**

---

## 우선순위 매트릭스

| 등급 | 의미 | 기준 | 목표 커버리지 |
| --- | --- | --- | --- |
| **P0** | 필수 | 서비스 핵심 동작, 깨지면 업무 불가 | 100% |
| **P1** | 중요 | 주요 사용자 흐름, 회귀 위험 높음 | 80% 이상 |
| **P2** | 권장 | 편의 기능, UX 품질 | 여유 시 |

### 추천 구현 순서
**Phase 1: Smoke Test** → **Phase 2: 네비게이션 & 가드** → **Phase 3: Happy Path** → **Phase 4: 폼 & 인터랙션**

> Phase 1만 완성해도 배포 안정성이 크게 올라간다.

---

## 실전 팁: "이건 E2E로 테스트하지 마세요"

| 시나리오 | 이유 | 대안 |
| --- | --- | --- |
| 유틸 함수의 엣지 케이스 | E2E로는 경우의 수를 커버하기 어렵고 느림 | 단위 테스트 (Vitest/Jest) |
| 컴포넌트의 props 조합 | N개의 조합을 브라우저에서 확인하는 건 비효율 | 컴포넌트 테스트 (Testing Library) |
| API 응답의 스키마 검증 | 프론트엔드 E2E가 아닌 API 테스트 영역 | API 테스트, 계약 테스트 |
| CSS 픽셀 단위 검증 | 환경마다 렌더링이 미세하게 다름 | 시각적 회귀 테스트 (Chromatic 등) |

---

## 시나리오 작성 템플릿
```typescript
import { test, expect } from '@playwright/test'

test.describe('[기능명]', () => {
  // Smoke: 페이지 로드 확인 (P0)
  test('[기능] 페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/[feature-path]')
    await expect(page).toHaveURL(/[feature-path]/)
    await expect(
      page.getByRole('heading', { name: /[페이지 제목]/i })
    ).toBeVisible()
  })

  // Happy Path: 핵심 인터랙션 (P1)
  test('[동작]하면 [결과]한다', async ({ page }) => {
    await page.goto('/[feature-path]')
    await page.getByRole('button', { name: /[동작]/i }).click()
    await expect(page.getByText('[기대 결과]')).toBeVisible()
  })
})
```

---

## 마치며
정리하면:
1. **Smoke Test부터 시작하라**
2. **크리티컬 패스에 집중하라**
3. **점진적으로 확장하라**
4. **테스트 피라미드를 존중하라**

"모든 것을 테스트하는 것"이 아니라, **"가장 중요한 것을 확실히 테스트하는 것"**이 E2E 테스트 전략의 핵심이다.
