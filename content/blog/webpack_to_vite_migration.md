---
title: "Webpack 4 → Vite 마이그레이션, 감이 아닌 근거로 설명하기"
slug: "webpack_to_vite_migration"
description: "레거시 React 프로젝트에서 Webpack 4가 느린 구조적 원인을 분석하고, Vite가 왜 효과적인지 수치와 아키텍처 차이로 정리했다."
categories: ["Frontend", "Software Architecture"]
keywords: []
createdTime: "2026-03-16T07:33:01.614Z"
lastEditedTime: "2026-03-29T05:23:03.227Z"
---

## 개요
프로젝트 투입 후, 32만줄 규모의 레거시 React 프로젝트에서 로컬 개발 서버 시작에 4~5분, HMR이 사실상 작동하지 않는 문제를 겪었다. Vite로 번들러를 교체하니 체감 속도가 극적으로 개선됐는데, "왜 빨라지는가"를 감이 아닌 구조적 근거로 설명하고 싶었다.

## 배경
- **번들러**: Webpack 4.44 (react-scripts 4.0.3 + react-app-rewired)
- **규모**: 835개 소스 파일, 317,971줄
- **node_modules**: 976MB, 1,463개 패키지
- **주요 스택**: React 17, Redux + Recoil + React Query, styled-components, MUI

## 문제

### 1. Cold Start 4~5분
Webpack 4는 **Bundle-based Dev Server**다. 개발 서버를 띄우려면 전체 소스코드를 파싱하고, 의존성 그래프를 구축하고, 번들을 생성한 뒤에야 브라우저에서 접근할 수 있다.

추가로 발견한 번들 비효율:

| 문제 | 영향 |
| --- | --- |
| moment.js 137개 locale 전부 포함 | IgnorePlugin 미설정, 불필요한 5.2MB |
| lodash 전체 import | tree-shaking 플러그인 없음, 4.9MB |
| core-js 풀 폴리필 | 현대 브라우저 타겟인데 14MB 폴리필 |
| 4중 폴리필 중복 | core-js + regenerator + react-app-polyfill + event-source-polyfill |

### 2. HMR 사실상 미작동
정확한 원인 파악에 실패했다. 추정되는 원인들:
- `react-app-rewired`로 CRA 내부 설정을 monkey-patch하면서 HMR 클라이언트 주입 타이밍이 꼬일 수 있다.
- 단일 컴포넌트에 `useState`가 29개인 파일에서는 React Fast Refresh가 state 보존을 포기한다.

### 3. 코드 구조가 번들러 병목을 악화시킴
- **196개 파일이 500줄 초과**
- **5,236줄짜리 컴포넌트**
- **상태 관리 3중 사용** — Redux + Recoil + React Query
- **109개 함수를 export하는 유틸리티 파일**

## 해결: Vite가 효과적인 구조적 근거

### 아키텍처 차이: Bundle vs Native ESM
```
[Webpack 4 — Bundle-based]
시작 → 전체 파일 파싱 → 의존성 그래프 구축 → 번들 생성 → Dev Server 시작
⏱️ 32만줄 전부 처리 후에야 브라우저 접근 가능

[Vite — Native ESM]
시작 → esbuild로 deps만 pre-bundle → Dev Server 즉시 시작
→ 브라우저가 요청하는 모듈만 on-demand 변환
⏱️ 요청된 파일만 처리
```
핵심은 **브라우저가 번들러의 역할을 일부 대신한다**는 점이다.

이 프로젝트에서 차이가 극적인 이유:
- **835개 파일 중 한 페이지에 필요한 건 20~30개** — Vite는 나머지를 건드리지 않는다
- **1,463개 패키지 resolve** — esbuild는 Go로 작성된 네이티브 바이너리라서 Webpack의 JavaScript 기반 resolve보다 10~100배 빠르다
- **moment.js 137 locale** — ESM에서는 import한 locale만 로드된다

### HMR 차이
```
[Webpack 4] 파일 변경 → 관련 청크 전체 리빌드 → 번들 교체
[Vite]      파일 변경 → 해당 모듈 1개만 ESM 교체 → 브라우저가 해당 모듈만 re-fetch
```

### 부수적 이점
- **설정 단순화** — `react-app-rewired` + `customize-cra`의 monkey-patch가 `vite.config.js` 하나로 대체
- **불필요한 코드 제거** — Vite의 ESM 타겟에서는 대부분의 폴리필이 불필요
- **최적화 자동 적용**

## 배운 점
- Bundle-based vs Native ESM의 아키텍처 차이.
- **번들러 병목은 번들러만의 문제가 아닐 수 있다.** 코드 구조는 번들러에게 번들링 대상이다. Vite가 병목을 완화해주지만 근본 원인은 코드 아키텍처에 있다.
- **레거시 프로젝트 분석 시 정량적 지표를 먼저 뽑아야 한다.**

## 참고 자료
- [Vite - Why Vite](https://vite.dev/guide/why.html) — Bundle vs Native ESM 아키텍처 비교
- [esbuild - FAQ](https://esbuild.github.io/faq/#why-is-esbuild-fast) — esbuild가 빠른 이유
- [React Fast Refresh](https://github.com/facebook/react/issues/16604) — Fast Refresh의 한계와 동작 방식
