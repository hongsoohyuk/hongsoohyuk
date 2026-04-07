---
title: "Cloudplex Delivery"
slug: "cloudplex_delivery"
description: "AWS CloudFront, Akamai 등 10개 이상의 CDN 벤더 리소스를 통합 관리하고 DNS 기반 라우팅 정책으로 트래픽을 제어하는 Multi-CDN Orchestration SaaS 솔루션"
createdTime: "2026-02-16T11:09:58.291Z"
lastEditedTime: "2026-02-16T11:10:23.457Z"
---

| **항목** | **내용** |
| --- | --- |
| 기간 | 2023.04 - 2024.10 |
| 역할 | 프론트엔드 단독 개발 (Admin 대시보드, 모니터링, 라우팅 정책, CDN 관리) |
| 기술 스택 | React 18, TypeScript, JavaScript, TanStack React Query v5, Redux Toolkit, MUI v5, Recharts, Emotion CSS-in-JS |
| 아키텍처 | Domain-driven (cpd-admin), Redux + Thunk (cpd-web), SSE Observer/Subscriber, Pub/Sub 모니터링 |
| 인프라 | Yarn 4 Berry 모노레포 (3 apps + 3 packages), AWS (Terraform, CodePipeline, CloudFront) |

---

# 핵심 도메인 기능 개발

### CPD Admin 대시보드 신규 설계 및 단독 개발

> 📖 ***개발 배경***
> - CPD 프로젝트 관리용 웹사이트(CPD-Admin) 개발 필요.
> - 비즈니스 로직 포함 UI의 공통 모듈화 요구.
> - 기존 CPD-Project에 TypeScript 도입 및 API 데이터 모델 통합 필요.

> 🔧 ***수행 내용***
> - **Domain-driven 구조 설계** — `domain/models/`, `domain/infrastructures/` 기반 타입 시스템
> - CDN, DNS, Credential, Endpoint, Storage, Routing Policy 등 리소스 관리
> - **프로젝트 생성 Stepper** — Route53 기반 자동 설정 (DNS Zone → Record 선택 → CDN/Endpoint 구성)
> - **자격 증명 관리** — 14개 CDN 벤더별 폼 검증 (AWS Assume Role, Akamai API Token, Azure 등)
> - **사용자 권한** — Space Role 기반 권한 설정, `AuthProtectedRoute` 인증 보호
> - **ErrorBoundary 아키텍처** — 컴포넌트/API 범위 에러 격리 및 글로벌 toast 알림 체계

> 📢 ***개발 성과***
> - cpd-admin 앱을 초기 설계부터 단독 구축. 조직(Space) 단위 CDN 전체 리소스 관리 대시보드 완성.

### CDN 실시간 모니터링 시스템 (Pub/Sub 패턴)

> 📖 ***개발 배경***
> - 스포츠 중계 등 장시간 스트리밍 이벤트 대응을 위한 실시간 CDN 상태 모니터링 및 라우팅 정책 즉시 수정 기능 필요.
> - CDN 제공사가 실시간 데이터를 즉시 제공하지 않으므로 polling 방식 데이터 수집 필요.
> - 최대 3시간 운영 시 브라우저 부하 최소화를 위한 효율적 렌더링 전략 필요.

> 🔧 ***수행 내용***
> - **실시간 차트** — Recharts 기반 25분 롤링 윈도우 (Bandwidth/Request/Hit Ratio/Success Ratio)
> - **임계치 액션** — 트래픽 임계치 도달 시 자동 가중치 조정 프로세스 큐 (Session Storage 상태 관리)
> - **가중치 실시간 변경** — 모니터링 화면에서 라우팅 정책 가중치 즉시 변경 및 반영
> - **OnNet CDN 대응** — OnNet 활성화/비활성화 상태별 UI 분기 처리

> 📢 ***개발 성과***
> - Pub/Sub 패턴 기반 데이터 변경 이벤트 관리로 구독 셀만 재렌더링. 장시간 모니터링에서도 **브라우저 부하 최소화 및 안정적 성능 확보**. (2024.04 ~ 2024.05)

### 라우팅 정책 V2 및 스케줄링 시스템

> 📖 ***개발 배경***
> DNS 라우팅 정책의 차세대 버전 요구. 기존 대비 정책 유형 확장 및 시간 기반 자동 가중치 변경 기능 필요.

> 🔧 ***수행 내용***
> - **4가지 정책 유형** — Simple, Weighted, Geolocation, Failover 생성/수정/복제
> - **OnNet 라우팅** — Custom CDN을 OnNet으로 등록하고 Failover와 연동하는 고급 라우팅
> - **스케줄 시스템** — Cron 기반 반복 일정(매일/매주/매월) 및 일회성 이벤트로 가중치 자동 변경
> - **DNS Zone 이력** — 버전별 반영 결과 조회

> 📢 ***개발 성과***
> **스케줄 시스템 신규 개발** 완료. DNS Zone 버전별 반영 결과 조회 및 API 버전별 분기 로직 구현.

### DNS Record Viewer 시스템

> 📖 ***개발 배경***
> 복잡한 DNS Zonefile 데이터 직관적 시각화 필요.

> 📢 ***개발 성과***
> **DFS 알고리즘** 기반 DNS Record 계층 구조 시각화 및 편집 기능 완성. (2023.05 ~ 2023.07)
> **DNS Record Viewer** — Zonefile 데이터 Tree 형태 파싱, DFS 알고리즘 활용 Map/Set 기반 Record 계층화 (Simple → Weighted → Geolocation → Failover), 노드별 인터랙션

### 주기별 지표 수집 및 임계치 알림

> 📖 ***개발 배경***
> - CDN별 일간 트래픽 데이터를 시각화하고 임계치 초과 시 자동 알림 필요.
> - CDN 벤더별로 수집 가능한 지표가 다르므로 유연한 Preset 설정 필요.

> 🔧 ***수행 내용***
> - **일간 지표 차트** — Recharts 기반 누적 데이터 (Bandwidth/Request/Hit Ratio)
> - **Metric Preset** — CDN 벤더별 수집 가능 지표 사전 설정
> - **임계치 관리** — CDN당 최대 3개 임계치, 차트 Reference Line 표시
> - **알림 연동** — Slack Webhook, Email 수신자, 임계치 초과 시 자동 알림

> 📢 ***개발 성과***
> - **Slack Webhook + Email 수신자 연동 자동 알림 시스템** 구축 완료.

---

# 구조 개선 작업

## Monorepo 구축 및 공유 패키지 개발

> 📖 ***개발 배경***
> - CPD-Admin 개발과 함께 디자인 시스템 및 비즈니스 로직 포함 UI 공통 모듈화 필요.
> - 기존 CPD-Project TypeScript 도입 및 Admin 공용 API 데이터 모델 통합 필요.
> - 3개 독립 레포 관리의 비효율적인 의존성 관리 문제.

> 🔧 ***수행 내용***
> - 3개 독립 레포를 Yarn-Berry 워크스페이스 모노레포로 통합
> - 공유 패키지 3개 설계 및 구현:
>   - `@packages/cp-ui` — 공통 컴포넌트(Stepper, NumberInputField), theme
>   - `@packages/cpd-ui` — CPD 전용 UI (PropertyContainer, EditableContent, CDN 아이콘, Table Row Skeleton)
>   - `@packages/legacy-ui` — cpd-web 기존 테마 호환 레거시 컴포넌트

> 📢 ***개발 성과***
> - Yarn-Berry PnP 통해 **유령 의존성 발견 및 잠재적 이슈 해결**
> - 공통 UI 컴포넌트 공통화로 유지보수성과 확장성 향상

```
의존성 관계:

cpd-web ────┬────► legacy-ui
            ▼
    ┌───► cpd-ui ───┐
    │               ▼
cpd-admin ──────► cp-ui
                    ▲
cp-start  ──────────┘
```

## IaC 도입 — Terraform 기반 CI/CD 파이프라인

> 📖 ***개발 배경***
> - AWS 개발 환경 통합 과정에서 기존 리소스 동일 사양 재구성 필요.
> - CPD-Admin 개발과 동시에 배포 환경 빠른 재현을 위한 자동화 인프라 요구.

> 🔧 ***수행 내용***
> - 3개 앱의 AWS 배포 파이프라인을 Terraform으로 코드화
> - AWS CodePipeline V2 기반 Source(GitHub) → Build(CodeBuild) → Deploy(S3 + CloudFront) 구성
> - 앱별 `buildspec.yml` 관리

> 📢 ***개발 성과***
> - CPD-Admin 및 CP-Launcher까지 동일 배포 라인을 명령어 한 줄로 재현 가능. **배포 일관성 확보 및 인프라 설정 실수 최소화**.

## SSE(Server-Sent Events) 실시간 업데이트 아키텍처

> 📖 ***개발 배경***
> - 서버 작업(Job) 완료/실패 이벤트를 실시간으로 UI에 반영할 필요.
> - 기존 polling 방식의 비효율적인 데이터 갱신 문제.

> 🔧 ***수행 내용***
> - Token 인증 기반 SSE 연결, 채널 타입별(User/Project Job) 분리
> - Observer/Subscriber 패턴으로 item 단위 업데이트 구현
> - 재사용 가능한 `useServerSentMessage` 커스텀 훅 개발

> 📢 ***개발 성과***
> - 전체 리페치 없이 변경된 항목만 갱신하여 불필요 재렌더링 **방지**.
