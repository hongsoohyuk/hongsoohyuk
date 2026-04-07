---
title: "SaaSOps"
slug: "saasops"
description: "기업용 SaaS Application 지출, 라이선스, 계약, 사용자, 워크플로우를 통합 관리하는 엔터프라이즈 어드민 플랫폼"
createdTime: "2026-02-16T11:08:20.630Z"
lastEditedTime: "2026-03-31T02:17:51.788Z"
---

| **항목** | **내용** |
| --- | --- |
| 기간 | 2024.10 - 2025.12 |
| 역할 | 프론트엔드 개발 (지출, 집계, 앱 관리 주요 개발) |
| 기술 스택 | React 18, TypeScript, Vite, React Query v5, Redux Toolkit, Recoil, MUI |
| 아키텍처 | Feature-Sliced Design (FSD), MVVM (ViewModel 패턴) |
| 인프라 | Yarn Berry v4 Monorepo, AWS (CloudFront, S3, CodeBuild, CodePipeline), Terraform |

---

# 핵심 도메인 기능 개발

### SaaS 비용 관리 (Spend Management)

> 📖 ***개발 배경***
> - SaaS 지출 등록을 위해 수동 입력, 카드 승인 내역, Invoice OCR 등 다양한 소스 지원 필요.
> - 지출 데이터에 환율 적용, 커스텀 필드, 조직 단위 연동 등 복잡한 비즈니스 로직이 결합되어 관심사 분리가 핵심 과제.

> 🔧 ***수행 내용 (누적 ~200 커밋)***
> - **비용 CRUD** — 목록 (페이지네이션/정렬), 생성 (RHF + Yup 검증), 상세 패널 (인라인 편집), 상세 페이지, CSV 일괄 업로드
> - **비용 대시보드** — 월별/연별 추이 차트, 벤더·조직·앱 별 순위 차트 (8종), 차트 클릭 → 상세 패널 드릴다운
> - **환율 처리** — 워크스페이스/조직 기본 통화 기준 자동 환산, 원화/엔화 소수점 제거, 환율 적용일 기반 계산
> - **비용 소스 연동** — 계약 선택 시 사용기간 자동 설정, OCR 결과 → 비용 자동 변환, 거래 내역 → 비용 생성
> - **비용 대상(Target)** — 앱 인스턴스/벤더 자동완성 선택 컴포넌트

> 📢 ***개발 성과***
> - ViewModel 패턴 도입으로 **기존 대비 기능별 코드 30% 감소**, OCR 기반 자동완성과 수동 Form의 결합을 간결하게 처리
> - 이후 개발된 비용 입력 기능 전반에 동일한 구조를 적용하여 **팀 내 재사용성과 안정성 측면에서 긍정적 피드백** 확보

### 비용 데이터 흐름
```
╔═════════════════╗    ╔═════════════════╗    ╔═════════════════╗
║  SPEND SOURCE   ║    ║   PROCESSING    ║    ║     OUTPUT      ║
╠═════════════════╣    ╠═════════════════╣    ╠═════════════════╣
║                 ║    ║                 ║    ║                 ║
║  Manual Input ──╫──┐ ║  Spend Form     ║    ║  Spend List     ║
║  Invoice OCR  ──╫──┼→║  (RHF + Yup)    ║    ║    │            ║
║  Card Txn     ──╫──┤ ║       │         ║    ║    ├→ Dashboard ║
║  CSV Upload   ──╫──┘ ║       ▼         ║    ║    │  (8 Charts)║
║                 ║    ║  Exchange Rate  ║──→ ║    │            ║
║                 ║    ║       │         ║    ║    └→ Detail    ║
║                 ║    ║       ▼         ║    ║       Panel     ║
║                 ║    ║  Custom Fields  ║    ║                 ║
╚═════════════════╝    ╚═════════════════╝    ╚═════════════════╝
```

### Invoice OCR 파이프라인

> 📖 ***개발 배경***
> - 인보이스 PDF 수동 확인 후 비용 입력 간편화 요구.
> - OCR 분석 결과의 신뢰도(Confidence)를 반영, 사용자가 쉽게 수정할 수 있는 UX 필요.

> 🔧 ***수행 내용***
> - **OCR 작업 관리** — 목록, 상세 패널, 벌크 업로드, 분석 중 폴링 처리
> - **분석 결과 UI** — 인식값 호버/선택 시 필드 포커스, 신뢰도 순 정렬
> - **OCR → Spend 변환** — 결과 기반 비용 생성 다이얼로그, 인보이스 파일 자동 첨부, 복수 비용 생성
> - **인보이스 메일 포워딩** — 매칭룰 관리 (화이트/블랙리스트), 임계치 조정
> - **PDF/이미지 뷰어** — `@packages/ui`에 `react-pdf` 기반 뷰어 컴포넌트 추가

> 📢 ***개발 성과***
> - 파일 업로드 → OCR 분석 → 결과 확인 → 비용 자동 변환까지의 **전체 파이프라인을 단독 구현**
> - 메일 포워딩 매칭룰을 통한 **인보이스 자동 수집** 워크플로우 완성

---

# 구조 개선 작업

## 모노레포 구축 및 Vite 마이그레이션

> 📖 ***개발 배경***
> - 기존에 4개의 독립 프로젝트(admin, launcher, my-account)가 각각 별도 레포지토리로 관리, 공통 로직 중복과 비효율적 의존성 관리.
> - Webpack 기반 CRA(react-scripts) 환경에서 사용하지 않거나 유령 참조하는 의존성 과다로 인해 개발 서버 구동 속도와 빌드 안정성 이슈.

> 🔧 ***수행 내용***
> - Yarn Berry v4 PnP 모노레포로 4개 앱 통합
> - 공유 패키지 3개 설계 및 구현:
>   - `@packages/core` — OpenAPI Generator 기반 API 클라이언트 자동 생성
>   - `@packages/ui` — MUI 래핑 컴포넌트 라이브러리
>   - `@packages/localization` — i18next 공용 인스턴스 (en/ko/ja)
> - 전체 앱 CRA → Vite 5.4 마이그레이션 (환경변수 패턴, HTTPS 설정)
> - Terraform 기반 AWS 배포 파이프라인 (CodePipeline, CodeBuild, S3, CloudFront)
> - Bitbucket Pipeline + SonarQube 코드 품질 분석 설정

> 📢 ***개발 성과***
> - **로컬 개발 환경 실행 속도를 최대 100배 개선** (Webpack → Vite ESM 기반)
> - 공유 패키지를 통해 앱 간 코드 중복을 제거하고, 일관된 UI/API 인터페이스 확보
> - 프론트엔드 챕터 내 Vite 전환 리뷰를 통해 지식 공유 문화에 기여

```
Architecture
┌────────────────────────────────────────────────────┐
│               Yarn Berry v4 Monorepo               │
├────────────────────────┬───────────────────────────┤
│         apps/          │         packages/         │
├────────────────────────┤───────────────────────────┤
│  admin-workspace       │ @packages/core            │
│  admin                 │   util functions + hooks  │
│  launcher              │   + Types (OpenAPI Gen)   │
│  my-account            ├───────────────────────────┤
│  storybook             │ @packages/ui              │
│                        │   80+ MUI Components      │
│                        ├───────────────────────────┤
│                        │ @packages/localization    │
│                        │   i18next (en/ko/ja)      │
└────────────────────────┴───────────────────────────┘

  의존성 관계:
  admin-workspace ──→ core, ui, localization
  admin           ──→ core, ui, localization
  launcher        ──→ ui, localization
  my-account      ──→ ui, localization
```

## App 분리 및 프로젝트 구조 정책 수립

> 📖 ***개발 배경***
> - admin 프로젝트가 비대해지면서 워크스페이스와 조직 간 도메인의 경계가 모호해지고, 코드 간 결합도가 높아지는 문제 발생.
>   - 레거시 코드 중 `isWorkspace` `isAdmin` 등 boolean 타입 기반 props 증식 만연.
>   - Single responsibility principle 등 SOLID 원칙 무시
> - 기능 간 의존 관계 파악이 어렵고, 높은 온보딩 비용.

> 🔧 ***수행 내용***
> - admin 앱에서 워크스페이스 도메인을 **admin-workspace** 독립 앱으로 분리
> - 크로스앱 리디렉션 로직 구현 (워크스페이스 ID 유효성 검증, org ↔ workspace 전환)
> - Feature-Sliced Design 레이어 구조 전환:
>   - `app` → `pages` → `widgets` → `features` → `entities` → `shared`
> - `eslint-plugin-boundaries`로 레이어 간 import 규칙 강제
> - Query Key Factory 패턴 도입 (`@lukemorales/query-key-factory`)
> - ViewModel 패턴 표준화 — `model/useXxxViewModel.ts`로 비즈니스 로직 분리
>   - ex) ListViewModel, DetailViewModel, FormViewModel
> - Cursor Rules 12개 작성 (FSD, TypeScript, React, React Query 등 팀 컨벤션 문서화)

> 📢 ***개발 성과***
> - 레이어별 명확한 책임 분리로 **기능 간 결합도 감소**, 독립적 개발 및 테스트 가능
> - 앱 분리를 통해 워크스페이스 도메인의 **독립적 배포 및 확장** 가능
> - TO_BE_REPLACED 디렉토리로 레거시 코드를 격리하여 점진적 마이그레이션 전략 수립

### FSD 구조

```
┌────────────────────────────────────────┐
│  app/                                  │
│  Providers, Store, Routes, API Config  │
└───────────────────┬────────────────────┘
                    │  import
┌───────────────────▼────────────────────┐
│  pages/                                │
│  Route-level Components                │
└─────────┬─────────┴─────────┬──────────┘
          │                   │
┌─────────▼──────────────────────────────┐
│  widgets/                              │
│  Composite Components (cross-feature)  │
└───────────────────┬────────────────────┘
                    │
┌───────────────────▼────────────────────┐
│  features/         (35+ slices)        │
│  Business Logic + UI per domain        │
└───────────────────┬────────────────────┘
                    │
┌───────────────────▼────────────────────┐
│  entities/         (27 domains)        │
│  Domain Models, Query Keys             │
└───────────────────┬────────────────────┘
                    │
┌───────────────────▼────────────────────┐
│  shared/                               │
│  Axios, Utils, Base UI, Config         │
└────────────────────────────────────────┘

↑ 상위 레이어는 하위 레이어만 import 가능 (역방향 금지)
↑ 같은 레이어 간 cross-import 금지 (entities @x 패턴 예외)
```

### AI 참조 문서화

> 💡 ***배경***
> Claude, Cursor 등 생성형 AI 도구를 활용 중 남용 사례 발생.
> - AI 책임 전가 — AI가 그렇게 만들어줬다, 그렇게 시켰다. 등
> - 일관되지 않은 논리 구조와 디렉토리 구조
> - 중복 코드 생성
> - 모듈화 미흡

> 🔧 AI 도구와 개발자 모두 참조 할 수 있는 프로그래밍 컨벤션과 프로젝트 설계 문서(FSD) 도입
>
> | Problem | Solution |
> | --- | --- |
> | 하나의 파일안에 Business Logic, UI Logic, 도메인별 조건 분기, UI type 별 조건 분기, Magic number 등 최대 코드 5,000 라인 파일. | 소프트웨어 설계 원칙 (OOP 원칙, FSD 설계 원칙, Code Review Skills) 기존 코드 리팩터링, 추가 기능 개발 등 활용할 수 있도록 문서화. |

---

# 공통 시스템 개발

## 범용 필터 시스템

> 🔧 ***수행 내용***
> - `FilterBar` — 필터 동적 추가/제거/초기화, 기본 설정 vs 사용자 추가 필터 구분
> - `FilterLocalSearch` — 정적 옵션 선택 필터.
> - `FilterServerSearch` — 동적 옵션 선택 필터.
>   - 도메인별 필터 — Application, AppInstance, License, User, Vendor, Workspace
> - 커스텀 필드 기반 필터 (문자/숫자/사용자 타입)

## 커스텀 필드 시스템

> 🔧 ***수행 내용***
> - 커스텀 필드 CRUD 관리 페이지, 유형별 attribute 필드 최적화
> - 비용/계약 폼에 커스텀 필드 **동적 렌더링**, Form ViewModel 공통화
> - 사용자별 테이블 컬럼 **개인화** (표시 컬럼 설정 저장/로드)
> - 커스텀 필드 기반 Like 검색 필터 연동

## 테이블 상태 관리 및 개인화

> 🔧 ***수행 내용***
> - `useTable` 훅 — `Tanstack Table` 테이블 상태 관리 일반화 (정렬, 페이지네이션, 선택)
> - 개인화 API 연동 — 사용자별 테이블 컬럼 설정 영구 저장
> - `@packages/ui`의 pinned column 로직 공통화, Magic number 제거

## 대시보드 위젯 시스템

> 🔧 ***수행 내용***
> - **워크스페이스 대시보드** — 비용 추이, 라이선스 현황, 비용 증감 퍼센트
> - **앱 대시보드** — Top 3 인스턴스 차트, AI 사용량 비용 위젯, 집계 위젯
> - **앱 인스턴스 대시보드** — 라이선스 비용 추이, 유사 앱 최적화 위젯
> - Early Access / Beta 기능 분리 (조직별 접근 제어)

---

# 기술적 의사결정

## TypeScript 및 OpenAPI Generator 도입

> 📖 ***개발 배경***
> - 기존 코드베이스가 JavaScript 기반으로 타입 안정성이 부족하고, API 데이터 모델이 자주 변경되어 높은 수동 대응 비용.

> 📢 ***개발 성과***
> - OpenAPI Generator로 5개 도메인(SMP, Organization, OCR, Application, File)의 interface/type **자동 생성** 파이프라인 구축
> - 백엔드 API 스펙 변경 시 `yarn core api:smp` 명령어를 통해 타입 안전한 갱신 → **커뮤니케이션 비용 절감**
> - TypeScript 도입으로 생산성 저하 없이 코드 품질 개선

## React Compiler 도입

> 📖 ***개발 배경***
> 기존 코드의 `useMemo`, `useCallback` 남용으로 인한 동작 이상 다수 발견.

> 🔧 ***수행 내용***
> React Compiler 설정 추가 및 `react-compiler-runtime` 통합
