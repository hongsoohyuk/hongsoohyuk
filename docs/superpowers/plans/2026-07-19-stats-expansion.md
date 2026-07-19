# /stats 지표 확장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 승인된 설계(`docs/superpowers/specs/2026-07-19-stats-expansion-design.md`)대로 /stats에 일별 페이지 히트맵, 유입 소스 추이 라인차트, 랜딩/종료/블로그 순위, vitals 스파크라인, 워스트 LCP를 추가한다.

**Architecture:** Supabase RPC 7개 신설 + `beacon_top_pages` locale 정규화 교체(공통 `beacon_norm_path` SQL 함수). `format.ts`에 순수 피벗 헬퍼, `queries.ts`에 병렬 RPC 합류. 차트는 전부 서버 컴포넌트 SVG/CSS — 클라이언트 JS 0.

**Tech Stack:** Next.js 16 서버 컴포넌트, Supabase RPC, Tailwind 4 (dark: variant는 next-themes class 기반), Jest + @testing-library/react.

## Global Constraints

- **커밋 금지**: 사용자가 명시 지시할 때만. 각 태스크는 테스트 통과로 종료.
- **dev 서버 조작 금지.** 동작 확인은 배포본/사용자 서버에 curl만.
- **React Compiler**: `memo`/`useMemo`/`useCallback` 수동 사용 금지.
- **클라이언트 JS 0**: 모든 신규 컴포넌트는 서버 컴포넌트. 툴팁은 네이티브 `title`/SVG `<title>`만.
- **차트 팔레트 (dataviz 검증 완료 — 임의 변경 금지)**: 카테고리 5슬롯 light `#2a78d6 #008300 #e87ba4 #eda100 #1baf7a` / dark `#3987e5 #008300 #d55181 #c98500 #199e70`. 시퀀셜(히트맵)·스파크라인은 슬롯1 단일 색 + opacity. 시리즈 색은 엔티티 고정 순서(순위 아님). 라이트 모드 contrast WARN relief = 범례 텍스트 라벨 + 인접 순위 리스트(테이블 뷰).
- **Tailwind JIT**: 색 클래스는 반드시 소스에 정적 문자열로 존재해야 함(`chart-palette.ts`의 완성형 클래스 배열만 사용, 런타임 문자열 조립 금지).
- **텍스트는 텍스트 토큰만**: 값/라벨/범례는 `text-muted-foreground` 등 — 시리즈 색을 텍스트에 쓰지 않는다.
- **KST 날짜 버킷** (`at time zone 'Asia/Seoul'`), path 정규화 `regexp_replace(path, '^/en(/|$)', '/')`.
- **jest.mock 팩토리에서 mock 변수는 지연 참조**(`(...args) => mockRpc(...args)`) — 즉시 평가 시 TDZ 에러(이전 세션에서 확인된 함정).
- 라우트 전용 코드는 `app/[locale]/stats/{_components,_lib}` colocate, kebab-case.

---

### Task 1: Supabase RPC — norm_path 헬퍼 + 신규 7개 + top_pages 교체

**Files:**
- Modify: `supabase/beacon.sql` (기존 `beacon_vitals` 함수 정의 뒤, revoke 블록 앞에 삽입 + 기존 `beacon_top_pages` 본문 교체 + revoke/grant 블록 확장)

**Interfaces:**
- Produces (Task 3의 `.rpc()` 호출이 의존):
  - `beacon_norm_path(p_url text) returns text` — 내부 헬퍼
  - `beacon_page_daily(p_site_id text, p_days int, p_limit int)` → `(day date, path text, pv bigint)`
  - `beacon_source_daily(p_site_id text, p_days int, p_limit int)` → `(day date, source text, sessions bigint)`
  - `beacon_landing_pages(p_site_id text, p_days int, p_limit int)` → `(path text, sessions bigint)`
  - `beacon_exit_pages(p_site_id text, p_days int, p_limit int)` → `(path text, sessions bigint)`
  - `beacon_top_blog_posts(p_site_id text, p_days int, p_limit int)` → `(path text, pv bigint)`
  - `beacon_vitals_daily(p_site_id text, p_days int)` → `(day date, metric text, p75 numeric)`
  - `beacon_worst_lcp_pages(p_site_id text, p_days int, p_limit int)` → `(path text, p75 numeric, samples bigint)`
- 사용자가 SQL Editor에서 파일 전체 재실행(idempotent) 후에야 실데이터 검증 가능. Jest는 DB 불필요.

- [ ] **Step 1: `beacon_top_pages` 본문을 정규화 버전으로 교체**

기존 함수의 `select coalesce(substring(url from '//[^/]+(/[^?#]*)'), '/'), count(*)` 라인을 `select beacon_norm_path(url), count(*)`로 교체. 단, `beacon_norm_path`가 먼저 정의돼야 하므로 파일에서 **`beacon_summary` 정의 앞**에 헬퍼를 추가:

```sql
-- URL → path 추출 + locale prefix 통합 (/en/blog/1 == /blog/1)
create or replace function beacon_norm_path(p_url text)
returns text
language sql immutable as $$
  select regexp_replace(coalesce(substring(p_url from '//[^/]+(/[^?#]*)'), '/'), '^/en(/|$)', '/');
$$;
```

- [ ] **Step 2: 신규 RPC 7개 추가** (기존 `beacon_vitals` 정의 뒤에 삽입)

```sql
-- 일별 페이지 분해: 기간 합산 top N 페이지의 날짜별 PV (히트맵용)
create or replace function beacon_page_daily(p_site_id text, p_days int, p_limit int)
returns table (day date, path text, pv bigint)
language sql stable as $$
  with top_paths as (
    select beacon_norm_path(url) as path
    from beacon_events
    where site_id = p_site_id and event_name = 'pageview'
      and received_at > now() - make_interval(days => p_days)
    group by 1 order by count(*) desc limit p_limit
  )
  select (received_at at time zone 'Asia/Seoul')::date,
         beacon_norm_path(url),
         count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at > now() - make_interval(days => p_days)
    and beacon_norm_path(url) in (select path from top_paths)
  group by 1, 2 order by 1;
$$;

-- 유입 소스 일별 추이: 기간 합산 top N 소스의 날짜별 세션 수 (라인차트용)
create or replace function beacon_source_daily(p_site_id text, p_days int, p_limit int)
returns table (day date, source text, sessions bigint)
language sql stable as $$
  with base as (
    select (received_at at time zone 'Asia/Seoul')::date as bucket,
           coalesce(nullif(utm->>'source', ''),
                    nullif(split_part(split_part(referrer, '//', 2), '/', 1), ''),
                    'direct') as src,
           session_id
    from beacon_events
    where site_id = p_site_id and event_name = 'pageview'
      and received_at > now() - make_interval(days => p_days)
  ),
  top_sources as (
    select src from base group by 1 order by count(distinct session_id) desc limit p_limit
  )
  select bucket, src, count(distinct session_id)
  from base
  where src in (select src from top_sources)
  group by 1, 2 order by 1;
$$;

-- 랜딩 페이지: 세션별 시간순 첫 pageview
create or replace function beacon_landing_pages(p_site_id text, p_days int, p_limit int)
returns table (path text, sessions bigint)
language sql stable as $$
  with firsts as (
    select distinct on (session_id) beacon_norm_path(url) as path
    from beacon_events
    where site_id = p_site_id and event_name = 'pageview' and session_id is not null
      and received_at > now() - make_interval(days => p_days)
    order by session_id, coalesce(client_ts, received_at) asc
  )
  select path, count(*) from firsts group by 1 order by 2 desc limit p_limit;
$$;

-- 종료 페이지: 세션별 시간순 마지막 pageview
create or replace function beacon_exit_pages(p_site_id text, p_days int, p_limit int)
returns table (path text, sessions bigint)
language sql stable as $$
  with lasts as (
    select distinct on (session_id) beacon_norm_path(url) as path
    from beacon_events
    where site_id = p_site_id and event_name = 'pageview' and session_id is not null
      and received_at > now() - make_interval(days => p_days)
    order by session_id, coalesce(client_ts, received_at) desc
  )
  select path, count(*) from lasts group by 1 order by 2 desc limit p_limit;
$$;

-- 블로그 글 순위 (정규화 path 기준)
create or replace function beacon_top_blog_posts(p_site_id text, p_days int, p_limit int)
returns table (path text, pv bigint)
language sql stable as $$
  select beacon_norm_path(url), count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at > now() - make_interval(days => p_days)
    and beacon_norm_path(url) like '/blog/%'
  group by 1 order by 2 desc limit p_limit;
$$;

-- Web Vitals 일별 p75 (스파크라인용)
create or replace function beacon_vitals_daily(p_site_id text, p_days int)
returns table (day date, metric text, p75 numeric)
language sql stable as $$
  select (received_at at time zone 'Asia/Seoul')::date,
         props->>'metric',
         percentile_cont(0.75) within group (order by (props->>'value')::numeric)
  from beacon_events
  where site_id = p_site_id and event_name = 'vital'
    and received_at > now() - make_interval(days => p_days)
    and props->>'metric' is not null
    and props->>'value' ~ '^[0-9]+\.?[0-9]*$'
  group by 1, 2 order by 1;
$$;

-- LCP 워스트 페이지 (표본 3개 미만 제외)
create or replace function beacon_worst_lcp_pages(p_site_id text, p_days int, p_limit int)
returns table (path text, p75 numeric, samples bigint)
language sql stable as $$
  select beacon_norm_path(url),
         percentile_cont(0.75) within group (order by (props->>'value')::numeric),
         count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'vital'
    and props->>'metric' = 'LCP'
    and props->>'value' ~ '^[0-9]+\.?[0-9]*$'
    and received_at > now() - make_interval(days => p_days)
  group by 1 having count(*) >= 3
  order by 2 desc limit p_limit;
$$;
```

- [ ] **Step 3: revoke/grant 블록 확장** (파일 끝 기존 블록에 추가)

```sql
revoke execute on function beacon_norm_path(text) from public, anon, authenticated;
revoke execute on function beacon_page_daily(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_source_daily(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_landing_pages(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_exit_pages(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_top_blog_posts(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_vitals_daily(text, int) from public, anon, authenticated;
revoke execute on function beacon_worst_lcp_pages(text, int, int) from public, anon, authenticated;
grant execute on function beacon_norm_path(text) to service_role;
grant execute on function beacon_page_daily(text, int, int) to service_role;
grant execute on function beacon_source_daily(text, int, int) to service_role;
grant execute on function beacon_landing_pages(text, int, int) to service_role;
grant execute on function beacon_exit_pages(text, int, int) to service_role;
grant execute on function beacon_top_blog_posts(text, int, int) to service_role;
grant execute on function beacon_vitals_daily(text, int) to service_role;
grant execute on function beacon_worst_lcp_pages(text, int, int) to service_role;
```

- [ ] **Step 4: 사용자 실행 (checkpoint)** — Supabase SQL Editor "beacon setup" 스니펫을 이 파일 내용으로 갱신 후 전체 실행. Task 6 live 검증 전까지만 완료되면 됨.

---

### Task 2: format.ts — dailyKeys/pivotDaily/vitalSparkSeries (TDD)

**Files:**
- Modify: `app/[locale]/stats/_lib/format.ts`
- Test: `app/[locale]/stats/_lib/__tests__/format.test.ts` (기존 파일에 describe 추가)

**Interfaces:**
- Consumes: 기존 `DailyPageviews` 타입.
- Produces (Task 4·5가 사용):
  - `dailyKeys(days: number, todayIso?: string): string[]` — KST 오늘 기준 과거 days개 'YYYY-MM-DD' 오름차순
  - `type DailyMatrix = {days: string[]; rows: Array<{key: string; cells: number[]; total: number}>}`
  - `pivotDaily(rows: Array<{day: string; key: string; value: number}>, days: number, todayIso?: string): DailyMatrix` — 결측 0 채움, rows는 total 내림차순
  - `vitalSparkSeries(rows: Array<{day: string; metric: string; p75: number}>, metric: string, days: number, todayIso?: string): Array<number | null>` — 결측일은 null(0 아님 — p75 0은 거짓 데이터)
  - 기존 `fillDailySeries`는 `dailyKeys` 재사용으로 리팩토링(시그니처·동작 불변, 기존 테스트로 회귀 확인)

- [ ] **Step 1: 실패하는 테스트 추가** (기존 format.test.ts 하단에)

```ts
describe('dailyKeys', () => {
  it('오늘 포함 과거 days개를 오름차순으로 반환한다', () => {
    expect(dailyKeys(3, '2026-07-19')).toEqual(['2026-07-17', '2026-07-18', '2026-07-19']);
  });
});

describe('pivotDaily', () => {
  const rows = [
    {day: '2026-07-18', key: '/blog/1', value: 5},
    {day: '2026-07-19', key: '/blog/1', value: 2},
    {day: '2026-07-19', key: '/', value: 9},
  ];

  it('키×날짜 매트릭스로 피벗하고 결측일은 0으로 채운다', () => {
    const m = pivotDaily(rows, 3, '2026-07-19');
    expect(m.days).toEqual(['2026-07-17', '2026-07-18', '2026-07-19']);
    expect(m.rows).toEqual([
      {key: '/', cells: [0, 0, 9], total: 9},
      {key: '/blog/1', cells: [0, 5, 2], total: 7},
    ]);
  });

  it('행은 total 내림차순', () => {
    const m = pivotDaily(rows, 3, '2026-07-19');
    expect(m.rows.map((r) => r.key)).toEqual(['/', '/blog/1']);
  });

  it('빈 입력이면 rows가 빈 배열', () => {
    expect(pivotDaily([], 7, '2026-07-19').rows).toEqual([]);
  });
});

describe('vitalSparkSeries', () => {
  it('해당 metric의 일별 p75를 뽑고 결측일은 null', () => {
    const rows = [
      {day: '2026-07-17', metric: 'LCP', p75: 1800},
      {day: '2026-07-19', metric: 'LCP', p75: 2100},
      {day: '2026-07-18', metric: 'CLS', p75: 0.02},
    ];
    expect(vitalSparkSeries(rows, 'LCP', 3, '2026-07-19')).toEqual([1800, null, 2100]);
  });
});
```

import 라인도 갱신: `import {dailyKeys, fillDailySeries, formatVitalValue, pivotDaily, ratingPercents, sortVitals, vitalSparkSeries} from '../format';`

- [ ] **Step 2: 실패 확인**

Run: `pnpm test -- "app/\[locale\]/stats/_lib/__tests__/format.test.ts"`
Expected: FAIL — `dailyKeys is not a function` (기존 테스트는 PASS 유지)

- [ ] **Step 3: 구현** (format.ts에 추가 + fillDailySeries 리팩토링)

```ts
export function dailyKeys(days: number, todayIso?: string): string[] {
  const today = todayIso ?? new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Seoul'});
  const end = new Date(`${today}T00:00:00Z`);
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export function fillDailySeries(rows: DailyPageviews[], days: number, todayIso?: string): DailyPageviews[] {
  const byDay = new Map(rows.map((r) => [r.day, r.pv]));
  return dailyKeys(days, todayIso).map((day) => ({day, pv: byDay.get(day) ?? 0}));
}

export type DailyMatrix = {days: string[]; rows: Array<{key: string; cells: number[]; total: number}>};

export function pivotDaily(
  rows: Array<{day: string; key: string; value: number}>,
  days: number,
  todayIso?: string,
): DailyMatrix {
  const keys = dailyKeys(days, todayIso);
  const dayIndex = new Map(keys.map((d, i) => [d, i]));
  const byKey = new Map<string, number[]>();
  for (const r of rows) {
    const i = dayIndex.get(r.day);
    if (i === undefined) continue;
    if (!byKey.has(r.key)) byKey.set(r.key, keys.map(() => 0));
    byKey.get(r.key)![i] += r.value;
  }
  const pivoted = [...byKey.entries()]
    .map(([key, cells]) => ({key, cells, total: cells.reduce((a, b) => a + b, 0)}))
    .sort((a, b) => b.total - a.total);
  return {days: keys, rows: pivoted};
}

export function vitalSparkSeries(
  rows: Array<{day: string; metric: string; p75: number}>,
  metric: string,
  days: number,
  todayIso?: string,
): Array<number | null> {
  const byDay = new Map(rows.filter((r) => r.metric === metric).map((r) => [r.day, r.p75]));
  return dailyKeys(days, todayIso).map((day) => byDay.get(day) ?? null);
}
```

(기존 `fillDailySeries` 본문은 위 리팩토링 버전으로 교체)

- [ ] **Step 4: 통과 확인**

Run: `pnpm test -- "app/\[locale\]/stats/_lib/__tests__/format.test.ts"`
Expected: PASS (기존 7 + 신규 6 = 13 tests)

---

### Task 3: queries.ts — 신규 타입 + RPC 7개 합류 (TDD)

**Files:**
- Modify: `app/[locale]/stats/_lib/queries.ts`
- Test: `app/[locale]/stats/_lib/__tests__/queries.test.ts` (기존 mock 확장)

**Interfaces:**
- Consumes: Task 1 RPC 이름/시그니처.
- Produces (Task 5가 사용):
  - 타입: `PageDailyRow {day: string; path: string; pv: number}`, `SourceDailyRow {day: string; source: string; sessions: number}`, `LandingPage {path: string; sessions: number}`, `VitalDailyRow {day: string; metric: string; p75: number}`, `WorstLcpPage {path: string; p75: number; samples: number}`
  - `BeaconStats`에 추가: `pageDaily: PageDailyRow[]`, `sourceDaily: SourceDailyRow[]`, `landing: LandingPage[]`, `exit: LandingPage[]`, `blogPosts: TopPage[]`, `vitalsDaily: VitalDailyRow[]`, `worstLcp: WorstLcpPage[]`
  - limit: pageDaily 10, sourceDaily 5, landing/exit 10, blogPosts 10, worstLcp 5

- [ ] **Step 1: 기존 테스트의 mock 데이터 맵 확장 + 신규 단언 추가**

`fetchStats` describe의 `mockRpc.mockImplementation` 데이터 맵에 추가:

```ts
        beacon_page_daily: [{day: '2026-07-19', path: '/blog/1', pv: 6}],
        beacon_source_daily: [{day: '2026-07-19', source: 'direct', sessions: 4}],
        beacon_landing_pages: [{path: '/', sessions: 3}],
        beacon_exit_pages: [{path: '/blog/1', sessions: 2}],
        beacon_top_blog_posts: [{path: '/blog/1', pv: 6}],
        beacon_vitals_daily: [{day: '2026-07-19', metric: 'LCP', p75: 1800}],
        beacon_worst_lcp_pages: [{path: '/instagram', p75: 3200, samples: 5}],
```

신규 테스트:

```ts
  it('확장 RPC 7개를 올바른 limit으로 호출해 합성한다', async () => {
    const stats = await fetchStats(7);
    expect(mockRpc).toHaveBeenCalledWith('beacon_page_daily', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(mockRpc).toHaveBeenCalledWith('beacon_source_daily', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 5});
    expect(mockRpc).toHaveBeenCalledWith('beacon_landing_pages', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(mockRpc).toHaveBeenCalledWith('beacon_exit_pages', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(mockRpc).toHaveBeenCalledWith('beacon_top_blog_posts', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(mockRpc).toHaveBeenCalledWith('beacon_vitals_daily', {p_site_id: 'hongsoohyuk.com', p_days: 7});
    expect(mockRpc).toHaveBeenCalledWith('beacon_worst_lcp_pages', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 5});
    expect(stats.pageDaily[0].path).toBe('/blog/1');
    expect(stats.sourceDaily[0].source).toBe('direct');
    expect(stats.landing).toHaveLength(1);
    expect(stats.exit).toHaveLength(1);
    expect(stats.blogPosts[0].pv).toBe(6);
    expect(stats.vitalsDaily[0].metric).toBe('LCP');
    expect(stats.worstLcp[0].samples).toBe(5);
  });
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm test -- "app/\[locale\]/stats/_lib/__tests__/queries.test.ts"`
Expected: FAIL — pageDaily undefined

- [ ] **Step 3: 구현** — queries.ts에 타입 추가, `BeaconStats` 확장, `fetchStats`의 `Promise.all` 배열에 7개 rpc 호출 추가:

```ts
export type PageDailyRow = {day: string; path: string; pv: number};
export type SourceDailyRow = {day: string; source: string; sessions: number};
export type LandingPage = {path: string; sessions: number};
export type VitalDailyRow = {day: string; metric: string; p75: number};
export type WorstLcpPage = {path: string; p75: number; samples: number};

export type BeaconStats = {
  summary: StatsSummary;
  daily: DailyPageviews[];
  sources: TrafficSource[];
  pages: TopPage[];
  vitals: VitalStat[];
  pageDaily: PageDailyRow[];
  sourceDaily: SourceDailyRow[];
  landing: LandingPage[];
  exit: LandingPage[];
  blogPosts: TopPage[];
  vitalsDaily: VitalDailyRow[];
  worstLcp: WorstLcpPage[];
};

export async function fetchStats(days: StatsPeriod): Promise<BeaconStats> {
  const base = {p_site_id: STATS_SITE_ID, p_days: days};
  const [summaryRows, daily, sources, pages, vitals, pageDaily, sourceDaily, landing, exit, blogPosts, vitalsDaily, worstLcp] =
    await Promise.all([
      rpc<StatsSummary[]>('beacon_summary', base),
      rpc<DailyPageviews[]>('beacon_daily_pageviews', base),
      rpc<TrafficSource[]>('beacon_top_sources', {...base, p_limit: 10}),
      rpc<TopPage[]>('beacon_top_pages', {...base, p_limit: 10}),
      rpc<VitalStat[]>('beacon_vitals', base),
      rpc<PageDailyRow[]>('beacon_page_daily', {...base, p_limit: 10}),
      rpc<SourceDailyRow[]>('beacon_source_daily', {...base, p_limit: 5}),
      rpc<LandingPage[]>('beacon_landing_pages', {...base, p_limit: 10}),
      rpc<LandingPage[]>('beacon_exit_pages', {...base, p_limit: 10}),
      rpc<TopPage[]>('beacon_top_blog_posts', {...base, p_limit: 10}),
      rpc<VitalDailyRow[]>('beacon_vitals_daily', base),
      rpc<WorstLcpPage[]>('beacon_worst_lcp_pages', {...base, p_limit: 5}),
    ]);
  return {summary: summaryRows[0] ?? EMPTY_SUMMARY, daily, sources, pages, vitals, pageDaily, sourceDaily, landing, exit, blogPosts, vitalsDaily, worstLcp};
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm test -- "app/\[locale\]/stats/_lib/__tests__/queries.test.ts"`
Expected: PASS (6 tests)

---

### Task 4: 차트 팔레트 + SVG 컴포넌트 3종 (render 테스트 포함)

**Files:**
- Create: `app/[locale]/stats/_lib/chart-palette.ts`
- Create: `app/[locale]/stats/_components/sparkline.tsx`
- Create: `app/[locale]/stats/_components/line-chart.tsx`
- Create: `app/[locale]/stats/_components/page-day-heatmap.tsx`
- Test: `app/[locale]/stats/_components/__tests__/charts.test.tsx`

**Interfaces:**
- Consumes: Task 2 `DailyMatrix`.
- Produces (Task 5가 사용):
  - `Sparkline({points}: {points: Array<number | null>})` — 유효값 2개 미만이면 null 렌더
  - `LineChart({series, emptyLabel}: {series: Array<{label: string; points: Array<{day: string; value: number}>}>; emptyLabel: string})` — 최대 5시리즈, SVG polyline + 범례
  - `PageDayHeatmap({matrix, emptyLabel}: {matrix: DailyMatrix; emptyLabel: string})` — table 기반, 30일은 가로 스크롤

- [ ] **Step 1: 팔레트 상수 작성** (완성형 정적 클래스만 — Tailwind JIT 추출용)

```ts
// app/[locale]/stats/_lib/chart-palette.ts
// dataviz 검증 완료 팔레트 (light/dark 각각 CVD·명도·채도 체크 통과) — 순서 변경 금지
export const SERIES_STROKE_CLASSES = [
  'stroke-[#2a78d6] dark:stroke-[#3987e5]',
  'stroke-[#008300] dark:stroke-[#008300]',
  'stroke-[#e87ba4] dark:stroke-[#d55181]',
  'stroke-[#eda100] dark:stroke-[#c98500]',
  'stroke-[#1baf7a] dark:stroke-[#199e70]',
];

export const SERIES_SWATCH_CLASSES = [
  'bg-[#2a78d6] dark:bg-[#3987e5]',
  'bg-[#008300] dark:bg-[#008300]',
  'bg-[#e87ba4] dark:bg-[#d55181]',
  'bg-[#eda100] dark:bg-[#c98500]',
  'bg-[#1baf7a] dark:bg-[#199e70]',
];

// 시퀀셜(히트맵)·스파크라인용 슬롯1 단일 색
export const HEAT_CELL_CLASS = 'bg-[#2a78d6] dark:bg-[#3987e5]';
export const SPARK_STROKE_CLASS = 'stroke-[#2a78d6] dark:stroke-[#3987e5]';
```

- [ ] **Step 2: 실패하는 render 테스트 작성**

```tsx
// app/[locale]/stats/_components/__tests__/charts.test.tsx
import {render, screen} from '@testing-library/react';
import {LineChart} from '../line-chart';
import {PageDayHeatmap} from '../page-day-heatmap';
import {Sparkline} from '../sparkline';

describe('Sparkline', () => {
  it('유효값 2개 미만이면 아무것도 렌더하지 않는다', () => {
    const {container} = render(<Sparkline points={[1800, null, null]} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('polyline을 렌더한다 (null은 건너뜀)', () => {
    const {container} = render(<Sparkline points={[1800, null, 2100]} />);
    const polyline = container.querySelector('polyline');
    expect(polyline).not.toBeNull();
    expect(polyline!.getAttribute('points')!.split(' ')).toHaveLength(2);
  });
});

describe('LineChart', () => {
  const series = [
    {label: 'direct', points: [{day: '2026-07-18', value: 3}, {day: '2026-07-19', value: 5}]},
    {label: 'google', points: [{day: '2026-07-18', value: 1}, {day: '2026-07-19', value: 0}]},
  ];

  it('시리즈 수만큼 polyline과 범례 라벨을 렌더한다', () => {
    const {container} = render(<LineChart series={series} emptyLabel="없음" />);
    expect(container.querySelectorAll('polyline')).toHaveLength(2);
    expect(screen.getByText('direct')).toBeInTheDocument();
    expect(screen.getByText('google')).toBeInTheDocument();
  });

  it('전부 0이면 empty 문구', () => {
    const zero = [{label: 'direct', points: [{day: '2026-07-19', value: 0}]}];
    render(<LineChart series={zero} emptyLabel="없음" />);
    expect(screen.getByText('없음')).toBeInTheDocument();
  });
});

describe('PageDayHeatmap', () => {
  const matrix = {
    days: ['2026-07-18', '2026-07-19'],
    rows: [{key: '/blog/1', cells: [3, 0], total: 3}],
  };

  it('행 헤더와 값 셀 title을 렌더한다', () => {
    render(<PageDayHeatmap matrix={matrix} emptyLabel="없음" />);
    expect(screen.getByText('/blog/1')).toBeInTheDocument();
    expect(screen.getByTitle('/blog/1 · 2026-07-18 · 3')).toBeInTheDocument();
  });

  it('rows가 비면 empty 문구', () => {
    render(<PageDayHeatmap matrix={{days: [], rows: []}} emptyLabel="없음" />);
    expect(screen.getByText('없음')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 실패 확인**

Run: `pnpm test -- "app/\[locale\]/stats/_components/__tests__/charts.test.tsx"`
Expected: FAIL — `Cannot find module '../line-chart'`

- [ ] **Step 4: 컴포넌트 3개 구현**

```tsx
// app/[locale]/stats/_components/sparkline.tsx
import {SPARK_STROKE_CLASS} from '../_lib/chart-palette';

type Props = {points: Array<number | null>};

export function Sparkline({points}: Props) {
  const values = points.filter((v): v is number => v !== null);
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const n = points.length;
  const coords = points
    .map((v, i) => (v === null ? null : `${n === 1 ? 50 : (i / (n - 1)) * 100},${26 - ((v - min) / range) * 24}`))
    .filter((c): c is string => c !== null)
    .join(' ');

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" className="mt-3 h-7 w-full">
      <polyline
        points={coords}
        fill="none"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={SPARK_STROKE_CLASS}
      />
    </svg>
  );
}
```

```tsx
// app/[locale]/stats/_components/line-chart.tsx
import {SERIES_STROKE_CLASSES, SERIES_SWATCH_CLASSES} from '../_lib/chart-palette';

type Point = {day: string; value: number};
type Series = {label: string; points: Point[]};
type Props = {series: Series[]; emptyLabel: string};

const W = 600;
const H = 200;
const PAD_X = 6;
const PAD_TOP = 8;
const PAD_BOTTOM = 6;

export function LineChart({series, emptyLabel}: Props) {
  const max = Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 0);
  if (series.length === 0 || max === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  const n = series[0].points.length;
  const x = (i: number) => (n === 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (n - 1));
  const y = (v: number) => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOTTOM);
  const firstDay = series[0].points[0]?.day;
  const lastDay = series[0].points[n - 1]?.day;

  return (
    <figure>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{max.toLocaleString()}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full sm:h-48" role="img">
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD_X} x2={W - PAD_X} y1={y(max * f)} y2={y(max * f)} strokeWidth={1} className="stroke-border" />
        ))}
        {series.map((s, si) => (
          <g key={s.label}>
            <polyline
              fill="none"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={s.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
              className={SERIES_STROKE_CLASSES[si]}
            />
            {s.points.map(
              (p, i) =>
                p.value > 0 && (
                  <circle key={p.day} cx={x(i)} cy={y(p.value)} r={8} fill="transparent">
                    <title>{`${p.day} · ${s.label}: ${p.value.toLocaleString()}`}</title>
                  </circle>
                ),
            )}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{firstDay}</span>
        <span>{lastDay}</span>
      </div>
      <figcaption className="mt-2">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {series.map((s, si) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span aria-hidden className={`size-2.5 rounded-sm ${SERIES_SWATCH_CLASSES[si]}`} />
              {s.label}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
```

```tsx
// app/[locale]/stats/_components/page-day-heatmap.tsx
import {HEAT_CELL_CLASS} from '../_lib/chart-palette';
import type {DailyMatrix} from '../_lib/format';

type Props = {matrix: DailyMatrix; emptyLabel: string};

export function PageDayHeatmap({matrix, emptyLabel}: Props) {
  if (matrix.rows.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  const max = Math.max(...matrix.rows.flatMap((r) => r.cells), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr>
            <td />
            {matrix.days.map((d) => (
              <th key={d} scope="col" title={d} className="min-w-3.5 pb-1 text-center font-normal text-muted-foreground">
                {Number(d.slice(8, 10))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="max-w-44 truncate pr-2 text-left font-normal text-foreground" title={row.key}>
                {row.key}
              </th>
              {row.cells.map((v, i) => (
                <td key={matrix.days[i]} title={`${row.key} · ${matrix.days[i]} · ${v}`} className="h-5">
                  {v > 0 ? (
                    <div className={`size-full min-h-5 rounded-[2px] ${HEAT_CELL_CLASS}`} style={{opacity: 0.2 + 0.8 * (v / max)}} />
                  ) : (
                    <div className="size-full min-h-5 rounded-[2px] bg-muted/60" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: 통과 확인**

Run: `pnpm test -- "app/\[locale\]/stats/_components/__tests__/charts.test.tsx"`
Expected: PASS (6 tests)

---

### Task 5: vitals 스파크라인 통합 + 페이지 조립 + 메시지

**Files:**
- Modify: `app/[locale]/stats/_components/vitals-panel.tsx` (Sparkline 삽입)
- Modify: `app/[locale]/stats/page.tsx` (신규 섹션 5개)
- Modify: `messages/ko.json`, `messages/en.json` (`Stats` 네임스페이스 키 추가)

**Interfaces:**
- Consumes: Task 2 `pivotDaily`/`vitalSparkSeries`/`DailyMatrix`, Task 3 확장 `BeaconStats`, Task 4 컴포넌트 3종, 기존 `RankList`/`formatVitalValue`.
- Produces: 최종 /stats 페이지. `VitalsPanel` props가 `{vitals, sparks, emptyLabel}`로 확장 — `sparks: Record<string, Array<number | null>>` (metric → 일별 p75, 없으면 빈 객체 허용).

- [ ] **Step 1: 메시지 키 추가** — `messages/ko.json`의 `"Stats"` 객체에 (privacyNote 뒤):

```json
    "pageDaily": "일별 페이지",
    "sourceTrend": "유입 소스 추이",
    "landing": "랜딩 페이지",
    "exitPages": "종료 페이지",
    "blogPosts": "블로그 글 순위",
    "worstLcp": "LCP 개선 필요 페이지",
    "worstLcpNote": "p75 기준, 표본 3회 이상 페이지만"
```

`messages/en.json`:

```json
    "pageDaily": "Pages by day",
    "sourceTrend": "Source trend",
    "landing": "Landing pages",
    "exitPages": "Exit pages",
    "blogPosts": "Top blog posts",
    "worstLcp": "Slowest pages by LCP",
    "worstLcpNote": "p75, pages with 3+ samples only"
```

- [ ] **Step 2: vitals-panel에 Sparkline 삽입**

props 확장 + 비율 바 아래 삽입:

```tsx
import {Sparkline} from './sparkline';
// ...
type Props = {vitals: VitalStat[]; sparks: Record<string, Array<number | null>>; emptyLabel: string};

export function VitalsPanel({vitals, sparks, emptyLabel}: Props) {
  // ...카드 내부, 비율 바 <p> 아래에:
  //   <Sparkline points={sparks[vital.metric] ?? []} />
}
```

기존 카드 구조 유지, `<p className="mt-1.5 ...">good ...%</p>` 다음 줄에 `<Sparkline points={sparks[vital.metric] ?? []} />` 한 줄 추가.

- [ ] **Step 3: page.tsx 조립**

import 추가:

```tsx
import {LineChart} from './_components/line-chart';
import {PageDayHeatmap} from './_components/page-day-heatmap';
import {fillDailySeries, pivotDaily, vitalSparkSeries} from './_lib/format';
```

`EMPTY_STATS`에 신규 필드 추가: `pageDaily: [], sourceDaily: [], landing: [], exit: [], blogPosts: [], vitalsDaily: [], worstLcp: []`.

데이터 가공 (기존 `const daily = ...` 아래):

```tsx
  const pageMatrix = pivotDaily(
    stats.pageDaily.map((r) => ({day: r.day, key: r.path, value: r.pv})),
    period,
  );
  const sourceMatrix = pivotDaily(
    stats.sourceDaily.map((r) => ({day: r.day, key: r.source, value: r.sessions})),
    period,
  );
  const sourceSeries = sourceMatrix.rows.map((r) => ({
    label: r.key,
    points: sourceMatrix.days.map((day, i) => ({day, value: r.cells[i]})),
  }));
  const sparks = Object.fromEntries(
    [...new Set(stats.vitalsDaily.map((r) => r.metric))].map((m) => [m, vitalSparkSeries(stats.vitalsDaily, m, period)]),
  );
```

섹션 배치 (기존 dailyTrend 섹션 뒤에 순서대로):

```tsx
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('pageDaily')}</h2>
        <PageDayHeatmap matrix={pageMatrix} emptyLabel={t('empty')} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('sourceTrend')}</h2>
        <LineChart series={sourceSeries} emptyLabel={t('empty')} />
      </section>
```

(기존 sources/topPages grid는 그대로 유지, 그 뒤에)

```tsx
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('landing')}</h2>
          <RankList items={stats.landing.map((p) => ({label: p.path, value: p.sessions}))} emptyLabel={t('empty')} />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('exitPages')}</h2>
          <RankList items={stats.exit.map((p) => ({label: p.path, value: p.sessions}))} emptyLabel={t('empty')} />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('blogPosts')}</h2>
        <RankList items={stats.blogPosts.map((p) => ({label: p.path, value: p.pv}))} emptyLabel={t('empty')} />
      </section>
```

vitals 섹션의 `<VitalsPanel vitals={stats.vitals} emptyLabel={t('empty')} />`를 `<VitalsPanel vitals={stats.vitals} sparks={sparks} emptyLabel={t('empty')} />`로 교체하고, 그 아래:

```tsx
      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold">{t('worstLcp')}</h2>
        <p className="mb-3 text-xs text-muted-foreground">{t('worstLcpNote')}</p>
        <RankList
          items={stats.worstLcp.map((p) => ({label: p.path, value: Math.round(p.p75)}))}
          emptyLabel={t('empty')}
        />
      </section>
```

- [ ] **Step 4: 전체 테스트 + lint + 타입체크**

Run: `pnpm test` → 전체 PASS. `pnpm lint` → stats/collect 경로 에러 0. `npx tsc --noEmit 2>&1 | grep -E "stats|collect"` → 출력 없음. `pnpm prettier --write "app/[locale]/stats/**/*.{ts,tsx}" messages/ko.json messages/en.json`.

---

### Task 6: 검증 체크포인트

- [ ] **Step 1 (사용자):** Supabase SQL Editor에서 갱신된 `supabase/beacon.sql` 전체 재실행.
- [ ] **Step 2:** REST로 신규 RPC 응답 확인 (에이전트 실행 가능):

```bash
set -a && source .env; set +a
for fn in beacon_page_daily beacon_source_daily beacon_landing_pages beacon_exit_pages beacon_top_blog_posts beacon_worst_lcp_pages; do
  curl -s -o /dev/null -w "$fn: %{http_code}\n" -X POST "$SUPABASE_URL/rest/v1/rpc/$fn" \
    -H "apikey: $SUPABASE_SECRET_KEY" -H "Authorization: Bearer $SUPABASE_SECRET_KEY" \
    -H 'Content-Type: application/json' -d '{"p_site_id":"hongsoohyuk.com","p_days":7,"p_limit":5}'
done
curl -s -o /dev/null -w "beacon_vitals_daily: %{http_code}\n" -X POST "$SUPABASE_URL/rest/v1/rpc/beacon_vitals_daily" \
  -H "apikey: $SUPABASE_SECRET_KEY" -H "Authorization: Bearer $SUPABASE_SECRET_KEY" \
  -H 'Content-Type: application/json' -d '{"p_site_id":"hongsoohyuk.com","p_days":7}'
```

Expected: 전부 200.

- [ ] **Step 3:** 사용자 dev 서버 또는 배포본에서 `/stats` 렌더 확인 (신규 섹션 7개 + 스파크라인). 커밋·배포는 사용자 지시 후.
