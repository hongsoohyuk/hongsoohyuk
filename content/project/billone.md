---
title: 'BillOne'
slug: 'billone'
description: 'GCP·Datadog·Alibaba·Akamai·Azure·Tencent 등 N개 클라우드 서비스 프로바이더(CSP)의 빌링/정산 콘솔을 하나의 프론트엔드 코드베이스로 서비스하는 멀티테넌트 SaaS 플랫폼'
createdTime: '2026-07-06T00:00:00.000Z'
lastEditedTime: '2026-07-06T00:00:00.000Z'
---

| **항목**  | **내용**                                                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기간      | 2026.01 - 현재                                                                                                                                      |
| 역할      | 프론트엔드 (플랫폼 아키텍처 설계, 개발 인프라 구축, CSP별 정산 도메인 개발)                                                                         |
| 기술 스택 | React 19 + React Compiler, TypeScript, rolldown-vite, TanStack Router/Query v5, Zustand, Tailwind 4 + shadcn/ui, react-hook-form + zod, DuckDB-WASM |
| 아키텍처  | App(CSP) Registry 패턴, Bulletproof React(단방향 import), Query Key Factory, OpenAPI 타입 자동 생성                                                 |
| 인프라    | Bitbucket Pipeline(AWS OIDC 키리스 S3 배포 + CloudFront), Vitest + MSW + Playwright, CSP 기준 git worktree + AI 병렬 개발                           |

---

# 핵심 아키텍처 설계

### App(CSP) Registry 패턴 — "분기 없는" 멀티테넌시

> 📖 **_개발 배경_**
>
> - 하나의 코드베이스로 CSP(GCP·Datadog·Alibaba 등)마다 조금씩 다른 대시보드/매입/매출/계약 화면을 서비스해야 한다.
> - 라우터·컴포넌트·네비게이션 곳곳에 `if (entity === 'gcp')` 분기가 퍼지고, CSP가 늘 때마다 수십 곳을 수정해야 하는 확장 불가능한 구조를 예방하고자 한다.
> - 향후 10+ CSP 확장을 전제로 한 선언형 구조가 핵심 과제.

> 🔧 **_수행 내용_**
>
> - 모든 "CSP × 기능" 변형을 `src/config/app-registry/` 한 곳에 **선언형 데이터**로 중앙화
>   - **Entity** = CSP 정체성 (`EntityId` 닫힌 유니온 타입 → `Record<EntityId, EntityConfig>`가 등록 누락을 컴파일 에러로 강제)
>   - **Feature** = 화면 (가시성 규칙 `all`/`only`/`except` + `(entity)→lazy 컴포넌트` resolve 맵)
> - 라우팅·가드·좌측 네비게이션을 전부 레지스트리의 **순수 파생물**로 자동 생성
> - `default` resolve 슬롯으로 미구현 CSP는 `FeatureComingSoon` 폴백 → 점진 롤아웃
> - ESLint `import/no-restricted-paths`로 `registry → features → shared` 단방향 강제, feature 간 cross-import 금지

```ts
// Entity 설정
export const azureApp: EntityConfig = {
  id: 'azure',
  label: 'Azure',
  shortLabel: 'Azure',
  defaultFeature: 'tenants',
  order: 5,
  contactEmail: 'sample_email@mz.co.kr',
};

// 가시성 = 판별 유니온 + exhaustive 스위치 (features.ts)
export const isFeatureVisible = (feature: FeatureEntry, entityId: EntityId): boolean => {
  switch (feature.visibility.mode) {
    case 'all':
      return true;
    case 'only':
      return feature.visibility.entities.includes(entityId);
    case 'except':
      return !feature.visibility.entities.includes(entityId);
  }
};

// 기능 = 메타데이터 + CSP별 lazy 로더 + default 폴백 (features/dashboard.ts)
export const dashboardFeature: FeatureDefinition = {
  id: 'dashboard',
  visibility: {mode: 'all'},
  order: 10,
  resolve: {
    gcp: () => import('@/features/gcp/dashboard/Dashboard').then((m) => ({default: m.DashboardPage})),
    datadog: () => import('@/features/datadog/dashboard/Dashboard').then((m) => ({default: m.DashboardPage})),
    // 미구현 CSP(Azure 등)는 안내 플레이스홀더로 우아하게 폴백
    default: () => import('@/components/layout/page/feature-coming-soon').then((m) => ({default: m.FeatureComingSoon})),
  },
};

export const adjustmentFeature: FeatureDefinition = {
  id: 'adjustment',
  translationKey: 'adjustment',
  icon: AdjustmentIcon,
  visibility: {mode: 'only', entities: ['gcp']},
  section: 'operations',
  order: 42,
  resolve: {
    gcp: () => import('@/features/gcp/adjustment/pages/AdjustmentPage').then((m) => ({default: m.AdjustmentPage})),
  },
};

// 라우트 파일은 한 줄 — 레지스트리가 가드와 페이지를 모두 공급
export const Route = createFileRoute('/$entity/adjustment/')({
  beforeLoad: createFeatureGuard('adjustment'), // 잘못된 CSP의 직접 URL 접근 차단
  component: createFeaturePage('adjustment'),
});
```

> 📢 **_개발 성과_**
>
> - **CSP 추가 = `apps/<csp>.ts` 1개 파일 + `EntityId` 유니온에 id 추가**로 축소. 라우팅·네비·가드·코드스플릿이 자동으로 따라옴.
> - 앱 전역에서 `if (entity === 'x')` 분기 **완전 제거** — 모든 변형이 두 개의 데이터 구조(entity/feature 레지스트리)에 선언적으로 존재.
> - 닫힌 `EntityId` 유니온 + exhaustive 스위치로 새 CSP/모드가 **컴파일 에러로 드러남** → 안전한 확장.

### Query Key Factory 기반 서버 상태 관리

> 📖 **_개발 배경_**
>
> - Repository/DI 패턴 대신, TanStack Query가 캐싱·중복 제거·라이프사이클을 담당하는 React에 자연스러운 데이터 접근 표준이 필요했다.

> 🔧 **_수행 내용_**
>
> - feature별 `api/queries.ts`(계층적 키 팩토리 + `useQuery`)와 `api/mutations.ts`(키 팩토리를 import해 스코프별 무효화) 구조 표준화
> - 테스트는 mock 구현/DI 대신 **MSW**로 네트워크 레벨 모킹

```ts
// features/datadog/accounts/api/queries.ts
export const accountKeys = {
  all: ['datadog-accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params: AccountSearchParams) => [...accountKeys.lists(), params] as const,
};
export const useLinkedAccounts = (
  params: AccountSearchParams,
  options?: UseQueryOptionsType<LinkedAccountListResponseDTO>,
) =>
  useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => apiClient.get<LinkedAccountListResponseDTO>('/datadog/account/v1/linked-accounts', {params}),
    ...options,
  });
```

> 📢 **_개발 성과_**
>
> - 계층적 키(`all → lists() → list(params)`)로 뮤테이션이 필요한 범위만 정밀 무효화 → 불필요한 리페치 제거.
> - 패턴을 문서화(`docs/query-key-factory-pattern.md`)하여 팀 전체 데이터 레이어 컨벤션으로 정착.

---

# 개발 인프라 구축

### 다국어 공용 관리 — 스프레드시트 SSOT + 타입세이프 파이프라인

> 📖 **_개발 배경_**
>
> - 번역을 프론트엔드 개발자가 소스 내부에서 JSON으로 관리할 경우, PO·운영 등 비개발자의 수정 요청에 개발자 병목이 발생.
> - 16개 네임스페이스 × 3개 언어 = 48개 JSON 수기 편집 → 오타·언어 desync·머지 충돌 상시 발생.

> 🔧 **_수행 내용_**
>
> - **Google Spreadsheet를 번역의 단일 소스(SSOT)로** 채택 — 팀 누구나 시트에서 ko/en/ja를 나란히 편집
> - `pnpm i18n:pull` 스크립트: Google **서비스 계정** 인증 → Drive export(xlsx) → 키 네이밍/중복/누락 **검증(위반 시 exit 1)** → `src/config/locale/{ko,en,ja}/<ns>.json` 자동 생성
> - i18next는 ko 정적 + en/ja lazy 로드
> - **생성된 JSON에서 키 유니온 타입을 파생**해 메뉴/배지 키까지 컴파일 타임 검증 (`as any` 제거)

```js
// scripts/pull-i18n.mjs — 서비스 계정 인증 + Drive export
const auth = new GoogleAuth({keyFile, scopes: ['https://www.googleapis.com/auth/drive.readonly']});
const token = await (await auth.getClient()).getAccessToken();
const url =
  `https://www.googleapis.com/drive/v3/files/${SHEET_ID}/export` +
  `?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
const res = await fetch(url, {headers: {Authorization: `Bearer ${token.token}`}});
return XLSX.read(await res.arrayBuffer(), {type: 'array'}); // 탭 하나 = 네임스페이스 하나
```

```ts
// 생성 resources에서 키 유니온 파생 → 없는 키면 컴파일 에러 (app-registry/types.ts)
export type NavTranslationKey = keyof (typeof resources)['navigation']
export type CommonTranslationKey = keyof (typeof resources)['common']
export const NavBadge = ({ labelKey }: { labelKey: CommonTranslationKey }) => {
  const { t } = useTranslation('common')
  return <Badge>{t(labelKey)}</Badge>   // as any 없이 완전 타입 세이프
}
```

> 📢 **_개발 성과_**
>
> - **비개발자 셀프서비스 번역** — PO·운영이 익숙한 스프레드시트에서 직접 카피 수정, PR·JSON 문법·코드 접근 불필요.
> - 48개 로케일 JSON을 모두 생성물로 관리 → **수기 편집 0**, 머지 충돌·언어 desync 제거.
> - 없는 메뉴/배지 키는 **컴파일 에러** → 레지스트리 기반 네비가 `as any` 없이 타입 안전하게 유지.

### AI 활용 병렬 개발 인프라 — CSP 기준 worktree + 커스텀 스킬

> 📖 **_개발 배경_**
>
> - 여러 CSP·기능을 **다중 AI 에이전트("팀")로 동시에** 개발하려면, 각 작업이 서로의 타입·번역·빌드를 오염시키지 않는 격리가 필수.
> - 브랜치·PR·Jira·UI 검증 같은 반복 업무를 자동화해 write-verify 루프를 단축할 필요가 있었다.

> 🔧 **_수행 내용_**
>
> - **CSP 기준 git worktree 모델** 설계: CSP마다 `base` 워크트리가 그 CSP의 생성 타입(`api:gen`)·번역(`i18n:pull`)의 SSOT, `feature` 워크트리는 이를 **symlink + `assume-unchanged`**로 참조 → 생성물이 feature 커밋을 오염시키지 않고, 각 CSP가 완전 병렬
> - Claude Code **커스텀 스킬** 세트 구축:
>   - `worktree-setup / rebase / cleanup` — 워크트리 라이프사이클 + "symlink 댄스" 리베이스 자동화
>   - `jira-doc / jira-description / pr-description` — 커밋 이력에서 Jira Description·PR 본문 자동 생성(markdown→ADF, `ai:assisted` 프로비넌스 라벨)
>   - `test-create` — Vitest 테스트 생성
> - **Playwright** 세 가지 구성: CLI 스킬(실시간 UI 디버깅·요청 모킹), MCP(Canvas/SVG 비주얼), Test Runner(CI, auth state 영속 + `fullyParallel`)

> 📢 **_개발 성과_**
>
> - CSP별 SSOT base + symlink 규율로 **다중 에이전트가 서로 다른 CSP를 무충돌 병렬 개발** — 생성 타입·번역이 diff로 감지되지 않도록 리베이스.
> - 여러 단계의 git/워크트리/Jira/PR 반복 업무를 단일 커맨드로 축약하고, 문서는 커밋 이력에서 자동 파생 → 개발 속도 향상.

---

# 기술적 의사결정

### 클라이언트사이드 CSV→Parquet 변환 (DuckDB-WASM)

> 📖 **_개발 배경_**
>
> - CSP 매입 CSV 업로드 시 **API Gateway 10MB 요청 제한**에 걸림. CSP 빌링 CSV는 수십 MB로 흔히 초과.
> - 서버 재조립이 필요한 raw 바이트 청킹은 다중 pod/LB 환경에서 불안정.

> 🔧 **_수행 내용_**
>
> - 브라우저에서 **DuckDB-WASM을 Web Worker로 구동**해 CSV를 압축 Parquet로 트랜스코딩하고 각 ~5MB **독립(self-contained) 파트**로 분할 → 서버가 파트별로 즉시 인제스트(재조립 불필요)
> - WASM 번들을 Vite `?url`로 **셀프호스팅**(CDN 미사용, same-origin Worker), `SharedArrayBuffer`/COOP+COEP를 피하기 위해 멀티스레드(coi) 번들 **의도적으로 제외**
> - `all_varchar=true`로 **타입 추론 비활성화** — DOUBLE 추론된 금액 컬럼의 부동소수 오차·비결정적 합계(정산 대사 파괴)와 월별 스키마 드리프트 방지, 캐스팅은 Postgres 인제스트 단계로 미룸
> - 분할은 `threads=1` + `preserve_insertion_order=true`로 **결정적 LIMIT/OFFSET** 보장(행 중복/손실 0)

```ts
// lib/duckdb/csv-to-parquet.ts — 무손실 VARCHAR 트랜스코드 → 압축 Parquet
await db.registerFileBuffer(name, new Uint8Array(await file.arrayBuffer())); // worker FileReader NotReadableError 회피
const conn = await db.connect();
await conn.query(`SET memory_limit='512MB'`); // 브라우저 내 OOM 가드
await conn.query(`SET threads TO 1`);
await conn.query(
  `COPY (SELECT * FROM read_csv('${name}', all_varchar=true, sample_size=-1)) ` +
    `TO 'full.parquet' (FORMAT PARQUET, COMPRESSION ZSTD, ROW_GROUP_SIZE 122880)`,
);
```

> 📢 **_개발 성과_**
>
> - 인프라(게이트웨이 한도) 변경 없이 **대용량 빌링 CSV 업로드를 클라이언트에서 해결**. 각 파트가 완결된 Parquet라 서버 재조립 로직 불필요, 다중 pod/LB 안전.
> - lazy 싱글턴 초기화(첫 업로드 시 1회)로 초기 페이지 로드에 미치는 영향을 최소화하고, ZSTD 압축 + ≤10MB는 변환을 스킵하는 임계 최적화.

### SSO 인증 인프라

> 🔧 **_수행 내용_**
>
> - 콜백 URL 해시에서 토큰 추출 → 쿠키 저장 → `/auth/me` 검증, 인증 초기화는 단일 `initPromise`(single-flight)
> - axios 인터셉터가 요청에 Bearer 주입, **초기화 이후** 401에서만 인증 정보 삭제 + 리다이렉트(체인 정지용 never-resolving promise로 에러 플래시 방지)

---

# 요약 — 나의 기여

1. **App(CSP) Registry 패턴 설계·도입** — `if(entity)` 분기를 선언형 레지스트리로 대체, 100+ CSP 확장 기반 마련(라우트/네비/가드/코드스플릿 자동 파생).
2. **다국어 공용 관리 파이프라인 구축** — 스프레드시트 SSOT + 서비스 계정 자동 pull + 생성 JSON 파생 타입세이프 키(`as any` 제거), 비개발자 셀프서비스 번역.
3. **AI 병렬 개발 인프라 구축** — CSP 기준 worktree/SSOT base/symlink 모델 + 워크트리·Jira·PR·검증 커스텀 스킬 → 다중 에이전트 무충돌 병렬 개발.
4. **DuckDB-WASM 클라이언트 변환 엔진** — API Gateway 10MB 한계를 브라우저 내 CSV→Parquet 변환·분할로 우회, 정산 대사 정확성(무손실 VARCHAR·결정적 분할) 보장.
