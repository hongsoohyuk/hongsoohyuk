---
title: "Playwright + AI: CLI vs MCP"
slug: "playwright_ai_cli_vs_mcp"
description: "AI 코딩 어시스턴트에서 Playwright를 활용하는 3가지 방법(CLI Skill, MCP Server, Test Runner)과 상황별 선택 기준을 정리했다."
categories: ["Frontend", "Test"]
keywords: []
createdTime: "2026-02-23T08:09:47.377Z"
lastEditedTime: "2026-02-24T00:07:14.877Z"
---

## AI가 브라우저를 조작하는 두 가지 방법
E2E 테스트를 작성할 때 가장 번거로운 것은 **올바른 Locator를 찾는 것**과 **실패 원인을 파악하는 것**이다.

AI 코딩 어시스턴트(Claude Code 등)가 실제 브라우저를 직접 조작하면서 이 과정을 도와줄 수 있는데, 방법이 **두 가지**나 있다. Playwright MCP(MCP Server)와 playwright-cli(Skill)다.

---

## 세 가지 도구, 각자의 역할

| 항목 | **playwright-cli** (Skill) | **@playwright/mcp** (MCP Server) | **Test Runner** |
| --- | --- | --- | --- |
| **정체** | AI가 Bash 명령어로 브라우저 제어 | AI가 네이티브 도구로 브라우저 제어 | 기존 Playwright 테스트 실행기 |
| **설치** | Skill 추가만 하면 됨 | MCP 서버 설정 필요 | `@playwright/test` 패키지 |
| **코드 생성** | 매 액션마다 자동 출력 | `--codegen` 옵션 필요 | 해당 없음 |
| **스냅샷** | YAML 파일로 자동 저장 | 호출 시에만 | 실패 시 스크린샷 |
| **API Mocking** | `route` 명령 한 줄 | 수동 설정 필요 | `page.route()` 코드 작성 |
| **안정성** | 높음 (독립 프로세스) | MCP 연결 상태에 의존 | 높음 |
| **Canvas/SVG** | 스크린샷으로 확인 | Vision 모드 지원 | 코드로 처리 |

---

## playwright-cli: CLI가 MCP보다 나은 이유

### 핵심 장점: 매 액션마다 코드가 나온다
```bash
playwright-cli fill e1 "user@example.com"
# 출력: await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');

playwright-cli click e3
# 출력: await page.getByRole('button', { name: 'Sign In' }).click();
```

### 스냅샷이 파일로 남는다
```bash
playwright-cli open http://localhost:3000
playwright-cli snapshot
# → .playwright-cli/page-2026-02-24T10-30-00.yml 자동 저장
```

### Request Mocking이 한 줄이면 된다
```bash
playwright-cli route "**/api/users" --body='[{"id":1}]' --content-type=application/json
playwright-cli unroute
```

### Storage 관리가 편하다
```bash
playwright-cli cookie-set auth_token my-token-value
playwright-cli state-load ./e2e/.auth/user.json
playwright-cli localstorage-list
```

---

## MCP가 여전히 필요한 경우

### Vision 모드
Canvas, 복잡한 SVG, 커스텀 렌더링 요소처럼 **접근성 트리에 잡히지 않는 시각적 요소**를 다룰 때는 MCP의 Vision 모드가 필요하다.

### Testing 전용 도구
`browser_generate_locator`, `browser_verify_element_visible` 같은 전용 검증 도구는 MCP에서만 제공한다.

> **결론** 테이블, 폼, 네비게이션 같은 일반적인 웹 UI는 CLI의 접근성 스냅샷만으로 충분하다. Vision 모드가 필요한 차트/Canvas UI에서만 MCP를 꺼내자.

---

## 상황별 선택 가이드

| 상황 | 추천 도구 | 이유 |
| --- | --- | --- |
| 테스트 코드 **작성** | playwright-cli | 매 액션마다 Playwright 코드 자동 생성 |
| **Locator 탐색** | playwright-cli | 스냅샷 파일로 구조 파악이 빠름 |
| **API Mocking** 테스트 | playwright-cli | `route` 명령 한 줄로 설정 |
| 실패 테스트 **디버깅** | playwright-cli | 스냅샷 파일 비교로 상태 추적 용이 |
| **Canvas/SVG** 검증 | MCP (Vision 모드) | 접근성 트리로 잡히지 않는 요소 처리 |
| 테스트 **실행** (전체 스위트) | Test Runner | 안정적, 반복 가능, 리포트 자동 생성 |
| **CI/CD** 파이프라인 | Test Runner | 헤드리스, 리트라이, 자동화 |

---

## 실전 워크플로우: CLI로 테스트 작성하기

### Step 1. 브라우저 열고 인증
```bash
playwright-cli open http://localhost:3000
playwright-cli cookie-set auth_token my-token
playwright-cli goto http://localhost:3000/dashboard
```

### Step 2. 스냅샷으로 페이지 구조 파악
```bash
playwright-cli snapshot
```

### Step 3. 액션 수행하며 코드 수집
```bash
playwright-cli click e3
# 출력: await page.getByRole('link', { name: '매출 관리' }).click();
```

### Step 4. 수집한 코드로 테스트 파일 작성
```typescript
import { test, expect } from '@playwright/test';

test('사이드바에서 매출 관리 페이지로 이동', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('link', { name: '매출 관리' }).click();
  await expect(page).toHaveURL(/.*revenue/);
});
```

---

## 배운 점
- **도구가 많다고 좋은 게 아니다.** 대부분의 작업에서는 CLI가 더 효율적이다.
- **MCP의 진짜 가치는 Vision 모드.**
- **도구별 역할을 명확히 나누면 효율이 올라간다.** 탐색/작성은 CLI, 시각적 검증은 MCP, 실행은 Test Runner.

## 참고 자료
- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- [playwright-cli](https://github.com/nicepkg/playwright-cli)
- [@playwright/mcp - npm](https://www.npmjs.com/package/@playwright/mcp)
