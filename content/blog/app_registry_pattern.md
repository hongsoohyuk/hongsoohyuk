---
title: "App Registry 패턴으로 멀티 엔티티 SaaS 프론트엔드 설계하기"
slug: "app_registry_pattern"
description: "100개 이상의 엔티티 확장을 고려한 App Registry 패턴으로, 조건 분기 없이 config 파일 하나로 엔티티를 추가할 수 있는 프론트엔드 아키텍처 설계 및 구현 과정"
categories: ["Frontend", "Software Architecture"]
keywords: []
createdTime: "2026-03-07T08:31:35.824Z"
lastEditedTime: "2026-03-29T05:38:02.992Z"
---

## 배경

클라우드 빌링 플랫폼을 개발하면서, 초기에는 **GCP** 하나의 CSP만 지원했다. 그런데 곧바로 **Datadog**이 추가되었고, 향후 **100개 이상의 클라우드 서비스**를 엔티티로 확장할 계획이 세워졌다.

초기 코드는 이렇게 생겼다:

```typescript
// ❌ Before: 조건 분기 지옥
if (vendor === 'gcp') {
  return <GcpPurchasePage />
} else if (vendor === 'datadog') {
  return <DatadogPurchasePage />
}
// vendor가 10개로 늘어나면?
```

**문제점:**

- 엔티티가 추가될 때마다 라우트 파일, 네비게이션, 레이아웃 등 **여러 파일에 조건 분기**가 우려
	- 엔티티별로 보여줄 메뉴가 다름. `isGcp` , `isDatadog` 으로 동일 컴포넌트 복잡도 증가 우려
		- 예상 시나리오 1) GCP 에선만 `cost-validation` 메뉴 노출
		- 예상 시나리오 2) Datadog 에선 `account` 에 특정 컴포넌트가 추가 노출
- 개발자가 엔티티를 추가하려면 **여러 파일 동시 수정 필요**

---

## 목표

1. **config 파일 하나만 추가**하면 새 엔티티가 작동하는 구조
2. 라우트 파일에서 `if (entity === 'xxx')` 같은 조건 분기 **완전 제거**
3. 엔티티별 메뉴 노출/숨김을 **선언적으로** 제어
4. 같은 기능이라도 엔티티별로 **다른 UI 컴포넌트**를 렌더링할 수 있어야 함

---

## 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  URL: /$entity/cost-validation                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────┐
│  TanStack Router                     │
│  Route File (thin wrapper, 3줄)      │
└──────────┬───────────┬───────────────┘
           │           │
           ▼           ▼
┌──────────────────────────────────────┐
│  App Registry                        │
│                                      │
│  createFeatureGuard()                │
│    → 엔티티 접근 권한 검증                │
│                                      │
│  createFeaturePage()                 │
│    → resolveComponent()              │
│    → lazy() + Map cache              │
└───┬──────────┬───────────┬───────────┘
    │          │           │
    ▼          ▼           ▼
┌────────┐ ┌────────┐ ┌──────────┐
│GCP     │ │Datadog │ │Common    │
│features│ │features│ │features  │
│/gcp/   │ │/datadog│ │/common/  │
│cost-   │ │/cost-  │ │dashboard │
│valid.. │ │valid.. │ │setting   │
└────────┘ └────────┘ └──────────┘
  entity     entity    resolve
  =gcp       =datadog  .default
```

---

## 핵심 설계: App Registry

### 디렉토리 구조

```javascript
src/config/app-registry/
├── types.ts          # EntityId, FeatureDefinition, FeatureVisibility
├── apps/             # 엔티티별 config
│   ├── gcp.ts
│   └── datadog.ts
├── entities.ts       # 엔티티 레지스트리
├── features/         # 기능별 정의
│   ├── dashboard.ts
│   ├── cost-validation.ts
│   ├── setting.ts
│   └── ...
├── features.ts       # 기능 레지스트리 + visibility 필터링
├── resolve.tsx       # 컴포넌트 resolve + lazy + cache
└── index.ts          # Public API
```

### 1. 엔티티 등록

 엔티티는 `EntityConfig` 객체 하나로 정의된다.

```typescript
// apps/gcp.ts
export const gcpApp: EntityConfig = {
  id: 'gcp',
  label: 'Google Cloud Platform',
  shortLabel: 'GCP',
  defaultFeature: 'dashboard',
  order: 1,
}
```

`EntityId` 유니온 타입에 추가하고, `entities.ts`의 레지스트리에 등록한다.

```typescript
// types.ts
export type EntityId = 'gcp' | 'datadog'  // ← 여기에 추가
```

### 2. Feature Visibility — 메뉴 노출 제어

각 기능이 어떤 엔티티에서 보이는지를 **선언적으로** 정의한다.

```typescript
export type FeatureVisibility =
  | { mode: 'all' }                              // 모든 엔티티에서 노출
  | { mode: 'only'; entities: EntityId[] }      // 특정 엔티티에서만 노출
  | { mode: 'except'; entities: EntityId[] }    // 특정 엔티티 제외
```

실제 사용 예시:

```typescript
// 대시보드 — 모든 엔티티에서 보임
visibility: { mode: 'all' }

// SKU 마스터 — GCP에서만 보임
visibility: { mode: 'only', entities: ['gcp'] }

// 정산 내역 — Datadog 제외
visibility: { mode: 'except', entities: ['datadog'] }
```

### 3. Feature 정의 + Resolve Map

각 기능은 `FeatureDefinition`으로 정의하고, `resolve` 맵으로 엔티티별 컴포넌트를 연결한다.

```typescript
// features/cost-validation.ts
export const costValidationFeature: FeatureDefinition = {
  id: 'cost-validation',
  translationKey: 'costValidation',    // i18n 키 (타입 안전)
  icon: ShoppingBasket,
  visibility: { mode: 'all' },
  order: 20,
  resolve: {
    gcp: () => import('@/features/gcp/cost-validation/pages/CostValidationPage')
      .then(m => ({ default: m.CostValidationPage })),
    datadog: () => import('@/features/datadog/cost-validation/pages/page')
      .then(m => ({ default: m.CostValidationPage })),
  },
}
```

**핵심: `resolve` 맵의 구조**

```typescript
resolve: Partial<Record<EntityId | 'default', () => Promise<{ default: React.ComponentType }>>>
```

- 엔티티별로 다른 컴포넌트를 lazy import
- `default` 키로 공통 컴포넌트 지정 가능
- 매칭 우선순위: `entity` 키 > `default` 키

### 4. Route File — Thin Wrapper

모든 라우트 파일이 **동일한 패턴**으로 최소화된다.

```typescript
// routes/$entity/cost-validation/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createFeaturePage } from '@/config/app-registry'

export const Route = createFileRoute('/$entity/cost-validation/')({
  component: createFeaturePage('cost-validation'),
})
```

**조건 분기가 없다.** `createFeaturePage()`가 URL의 `$entity` 파라미터를 읽어 적절한 컴포넌트를 resolve한다.

### 5. Component Resolve + Cache

```typescript
// resolve.tsx
const componentCache = new Map<string, React.LazyExoticComponent<React.ComponentType>>()

export const resolveComponent = (featureId: string, entityId: EntityId) => {
  const cacheKey = `${featureId}:${entityId}`
  const cached = componentCache.get(cacheKey)
  if (cached) return cached

  const feature = getFeature(featureId)
  const loader = feature.resolve[entityId] ?? feature.resolve['default']
  const component = lazy(loader)
  componentCache.set(cacheKey, component)
  return component
}
```

`lazy()` + `Map` 캐시로 **동일 엔티티+기능 조합은 한 번만 로드**된다.

> React Compiler의 `static-components` 룰이 `lazy()`를 렌더 중 호출로 감지하지만, Map 캐시가 안정적인 참조를 보장하므로 `eslint-disable`로 허용했다.

### 6. Feature Guard — URL 직접 접근 차단

`FeatureVisibility`가 `only`나 `except`인 기능은 URL 직접 입력으로 우회할 수 있다. `beforeLoad` 훅으로 차단한다.

```typescript
export const createFeatureGuard = (featureId: string) =>
  ({ params }: { params: { entity: string } }) => {
    const feature = getFeature(featureId)
    const entityId = params.entity as EntityId

    if (!isFeatureVisible(feature, entityId) ||
        !hasComponentForEntity(feature, entityId))
      throw redirect({ to: '/$entity/dashboard', params })
  }
```

---

## 네비게이션 자동 생성

네비게이션 메뉴는 레지스트리에서 **자동 생성**된다. 하드코딩 없음.

```typescript
// nav-items.ts
export const getNavItems = (entityId: EntityId): NavItem[] => {
  const features = getFeaturesForEntity(entityId)  // visibility 필터링 적용
  const base = `/${entityId}`

  return features
    .filter(f => !f.id.includes('/'))  // 자식 기능 제외
    .map(feature => ({
      id: feature.id,
      translationKey: feature.translationKey,
      icon: <feature.icon className="h-4 w-4" />,
      href: `${base}/${feature.id}`,
      children: (feature as NavGroupDefinition).children?.map(...),
    }))
}
```

`getFeaturesForEntity('gcp')`을 호출하면 GCP에서 보여야 할 기능만 필터링되어 네비게이션이 생성된다.

---

## Feature 모듈 디렉토리 구조

```javascript
src/features/
├── common/              # 공통 기능 (dashboard, setting)
│   ├── dashboard/
│   └── setting/
├── gcp/                 # GCP 전용
│   ├── cost-validation/
│   ├── revenue-validation/
│   ├── account/
│   ├── customer-contract/
│   └── ...
├── datadog/             # Datadog 전용
│   ├── cost-validation/
│   └── revenue-validation/
└── auth/                # 인증
```

- `common/` — 모든 엔티티에서 공유 (`resolve.default`로 연결)
- `gcp/`, `datadog/` — 엔티티별 도메인 로직 (같은 기능도 UI/API가 다를 수 있음)

---

## 엔티티 추가 시나리오

새로운 엔티티(e.g. AWS)를 추가할 때 필요한 작업:

**Step 1.** `types.ts`에 `EntityId` 추가

```typescript
export type EntityId = 'gcp' | 'datadog' | 'aws'
```

**Step 2.** `apps/aws.ts` 생성

```typescript
export const awsApp: EntityConfig = {
  id: 'aws',
  label: 'Amazon Web Services',
  shortLabel: 'AWS',
  defaultFeature: 'dashboard',
  order: 3,
}
```

**Step 3.** `entities.ts`에 등록

```typescript
const entityRegistry: Record<EntityId, EntityConfig> = {
  gcp: gcpApp,
  datadog: datadogApp,
  aws: awsApp,  // ← 추가
}
```

**Step 4.** 기존 feature의 `resolve`에 AWS 컴포넌트 연결

```typescript
// features/cost-validation.ts
resolve: {
  gcp: () => import('@/features/gcp/cost-validation/...'),
  datadog: () => import('@/features/datadog/cost-validation/...'),
  aws: () => import('@/features/aws/cost-validation/...'),  // ← 추가
}
```

**라우트 파일, 네비게이션, 레이아웃은 수정할 필요없다.** 레지스트리에서 자동으로 처리된다.

ps. 사실 구조만 이렇게 잡아두고, Claude SKILL 로 정리해둔 문서를 통해 Agent 에게 확장을 부탁하면 된다.

---

## 순환 의존성 방지

App Registry와 Feature 모듈 간 순환 의존성을 ESLint로 차단한다.

```
                  import              import
routes/  ──────────────►  config/app-registry/  ◄──── ✕ ESLint 차단
  │                              │                         │
  │         import               │  lazy import only       │
  └──────────────►  features/  ◄─┘                  features/
```

- `features/` → `config/app-registry/` import **금지** (ESLint `import/no-restricted-paths`)
- `config/app-registry/` → `features/` 는 `resolve`의 **lazy import**만 허용 (런타임 의존)
- 이 규칙이 없으면 feature가 registry를 참조하고, registry가 feature를 참조하는 순환이 발생

---

## Before / After 비교

| **항목** | **Before** | **After (App Registry)** |
| --- | --- | --- |
| 엔티티 추가 | 라우트 + 네비 + 레이아웃 등 5~10개 파일 수정 | config 파일 2~3개만 추가 |
| 라우트 파일 | if/else 조건 분기 로직 포함 | 3줄 thin wrapper (조건 분기 제로) |
| 네비게이션 | 하드코딩된 메뉴 배열 | 레지스트리에서 자동 생성 + visibility 필터 |
| 메뉴 노출 제어 | 코드로 if 분기 | 선언적 visibility (all / only / except) |
| 컴포넌트 로딩 | 모든 엔티티 컴포넌트가 번들에 포함 | lazy() + cache로 해당 엔티티만 로드 |
| URL 직접 접근 | 보호 없음 | createFeatureGuard()로 redirect |

---

## 회고

**잘된 점:**

- 라우트 파일 15개에서 조건 분기를 **완전히 제거** (577 줄 추가, 317 줄 삭제)
- 엔티티 추가 시 수정 파일 수가 **5~10개 → 2~3개**로 감소
- `FeatureVisibility` 타입으로 메뉴 노출 규칙이 **자기 문서화(self-documenting)**
- ESLint 순환 의존성 방지로 아키텍처 규칙이 **자동 강제**

**배운 점:**

- 초기에 `lazy()`를 렌더 중 호출하면 React Compiler의 `static-components` 룰에 걸림 → Map 캐시로 안정적 참조를 보장하는 방식으로 해결
- Registry 패턴은 **관심사의 분리**(Separation of Concerns)가 핵심 — "어떤 컴포넌트를 보여줄지"는 registry가, "어떻게 보여줄지"는 feature 모듈이 책임
- `$vendor` → `$entity` 리네이밍을 초기에 하길 잘함 — 도메인 용어가 정립되면 코드 이해도가 높아짐
