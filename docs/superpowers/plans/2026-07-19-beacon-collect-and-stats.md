# Beacon 수집 서버 + /stats 지표 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Beacon SDK 이벤트를 받아 Supabase에 저장하는 `/api/collect` 엔드포인트(S1)와 집계 지표를 보여주는 공개 `/stats` 페이지(S3)를 구현한다. SDK 설치(S2)는 SDK 저장소가 `init`/`webVitals`를 출시하면 실행한다.

**Architecture:** 수집은 `app/api/collect/route.ts`(zod 검증 → `supabaseAdmin` 배치 insert, 실패해도 204). 집계는 Postgres RPC 함수 5개(supabase-js는 raw SQL을 못 돌리므로 DB 함수로 집계)를 서버 컴포넌트에서 호출하고 `unstable_cache`로 5분 캐시. 차트는 서버 렌더 CSS 막대 — 클라이언트 JS 0.

**Tech Stack:** Next.js 16 App Router, zod 4, @supabase/supabase-js(기존 `supabaseAdmin`), next-intl, Tailwind 4, Jest.

## Global Constraints

- **커밋 금지**: 사용자가 명시적으로 지시할 때만 `git commit`. 각 태스크는 테스트 통과로 종료.
- **dev 서버 조작 금지**: `pnpm dev` 실행/종료 절대 금지. 동작 확인은 사용자 서버에 `curl`만.
- **React Compiler**: `memo`/`useMemo`/`useCallback` 수동 사용 금지.
- **Supabase 키**: 기존 `supabaseAdmin`(`SUPABASE_SECRET_KEY`, service role 동급) 재사용. 새 환경변수 불필요. `NEXT_PUBLIC_` 접두사 금지, 클라이언트에서 Supabase 직접 조회 금지.
- **IP는 저장하지 않는다.** anonId는 페이지에 노출하지 않는다(집계 수치만).
- 배치당 이벤트 50개 초과 → `400`. 검증 실패 → `400`. 성공/저장 실패 모두 → `204`(저장 실패는 서버 로깅).
- CORS allowlist: `hongsoohyuk.com`, `www.hongsoohyuk.com`, `localhost`, `127.0.0.1`.
- `dynamic = 'force-static'` 금지(next-intl 4.4 충돌). `/stats`는 searchParams 사용으로 동적 렌더 → 캐시는 `unstable_cache(revalidate: 300)`으로.
- 파일명 kebab-case, 라우트 전용 코드는 `_components/`/`_lib/`에 colocate.
- 스펙 문서 범위 안에서 결정이 필요하면 단순한 쪽 선택.

---

### Task 1: Supabase 테이블 + 집계 RPC 함수 (SQL 파일)

**Files:**
- Create: `supabase/beacon.sql`

**Interfaces:**
- Produces: `beacon_events` 테이블, RPC 함수 `beacon_summary(p_site_id text, p_days int)`, `beacon_daily_pageviews(p_site_id, p_days)`, `beacon_top_sources(p_site_id, p_days, p_limit int)`, `beacon_top_pages(p_site_id, p_days, p_limit)`, `beacon_vitals(p_site_id, p_days)` — Task 5의 `.rpc()` 호출이 이 이름·파라미터에 의존.
- 참고: supabase-js는 임의 SQL 실행이 불가하므로 집계를 DB 함수로 만든다. RLS에 공개 정책이 없고, 함수도 anon/authenticated에서 EXECUTE를 회수하므로 service role로만 접근 가능.

- [ ] **Step 1: SQL 파일 작성**

```sql
-- supabase/beacon.sql
-- Supabase Dashboard > SQL Editor에서 1회 실행 (idempotent)

create table if not exists beacon_events (
  id          bigint generated always as identity primary key,
  site_id     text not null,
  event_name  text not null,
  anon_id     text,
  session_id  text,
  url         text,
  referrer    text,
  utm         jsonb,
  props       jsonb,
  client_ts   timestamptz,
  received_at timestamptz not null default now()
);

create index if not exists beacon_events_site_event_ts_idx
  on beacon_events (site_id, event_name, received_at);
create index if not exists beacon_events_site_ts_idx
  on beacon_events (site_id, received_at);

alter table beacon_events enable row level security;
-- 공개 정책 없음: 읽기/쓰기 모두 service role로만.
revoke all on table beacon_events from anon, authenticated;

-- 요약 카드: 페이지뷰 / 방문자(고유 anon_id) / 세션 / 클릭
create or replace function beacon_summary(p_site_id text, p_days int)
returns table (pageviews bigint, visitors bigint, sessions bigint, clicks bigint)
language sql stable as $$
  select count(*) filter (where event_name = 'pageview'),
         count(distinct anon_id) filter (where event_name = 'pageview'),
         count(distinct session_id) filter (where event_name = 'pageview'),
         count(*) filter (where event_name = 'click')
  from beacon_events
  where site_id = p_site_id
    and received_at > now() - make_interval(days => p_days);
$$;

-- 일별 페이지뷰 (KST 기준 날짜)
create or replace function beacon_daily_pageviews(p_site_id text, p_days int)
returns table (day date, pv bigint)
language sql stable as $$
  select (received_at at time zone 'Asia/Seoul')::date, count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at > now() - make_interval(days => p_days)
  group by 1 order by 1;
$$;

-- 유입 경로: utm_source 우선, 없으면 referrer 도메인, 없으면 direct
create or replace function beacon_top_sources(p_site_id text, p_days int, p_limit int)
returns table (source text, sessions bigint)
language sql stable as $$
  select coalesce(nullif(utm->>'source', ''),
                  nullif(split_part(split_part(referrer, '//', 2), '/', 1), ''),
                  'direct'),
         count(distinct session_id)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at > now() - make_interval(days => p_days)
  group by 1 order by 2 desc limit p_limit;
$$;

-- 인기 페이지: URL path별 페이지뷰
create or replace function beacon_top_pages(p_site_id text, p_days int, p_limit int)
returns table (path text, pv bigint)
language sql stable as $$
  select coalesce(substring(url from '//[^/]+(/[^?#]*)'), '/'), count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at > now() - make_interval(days => p_days)
  group by 1 order by 2 desc limit p_limit;
$$;

-- Web Vitals: metric별 p75 + rating 분포 (rating은 SDK가 계산해 props.rating으로 보냄)
create or replace function beacon_vitals(p_site_id text, p_days int)
returns table (metric text, p75 numeric, good bigint, needs_improvement bigint, poor bigint, total bigint)
language sql stable as $$
  select props->>'metric',
         percentile_cont(0.75) within group (order by (props->>'value')::numeric),
         count(*) filter (where props->>'rating' = 'good'),
         count(*) filter (where props->>'rating' = 'needs-improvement'),
         count(*) filter (where props->>'rating' = 'poor'),
         count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'vital'
    and received_at > now() - make_interval(days => p_days)
    and props->>'metric' is not null
    and props->>'value' ~ '^[0-9]+\.?[0-9]*$'
  group by 1;
$$;

-- 함수는 service role로만 호출 (PostgREST가 anon에게 노출하지 않도록)
revoke execute on function beacon_summary(text, int) from public, anon, authenticated;
revoke execute on function beacon_daily_pageviews(text, int) from public, anon, authenticated;
revoke execute on function beacon_top_sources(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_top_pages(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_vitals(text, int) from public, anon, authenticated;
grant execute on function beacon_summary(text, int) to service_role;
grant execute on function beacon_daily_pageviews(text, int) to service_role;
grant execute on function beacon_top_sources(text, int, int) to service_role;
grant execute on function beacon_top_pages(text, int, int) to service_role;
grant execute on function beacon_vitals(text, int) to service_role;
```

- [ ] **Step 2: 사용자 실행 요청 (checkpoint — 사용자만 가능)**

사용자가 Supabase Dashboard > SQL Editor에서 `supabase/beacon.sql` 전체를 실행해야 한다. Task 4 완료 후 live curl 검증 전까지만 실행되면 됨. (Jest 테스트는 DB 없이 통과한다.)

---

### Task 2: 수집 페이로드 zod 스키마

**Files:**
- Create: `app/api/collect/_lib/schema.ts`
- Test: `app/api/collect/_lib/__tests__/schema.test.ts`

**Interfaces:**
- Produces: `beaconBatchSchema` (zod 스키마), 타입 `BeaconBatch`, `BeaconEvent`. Task 4의 route가 `beaconBatchSchema.safeParse(body)`로 사용.
- zod 4 문법: `z.iso.datetime()`, `z.record(keySchema, valueSchema)` 2-인자.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// app/api/collect/_lib/__tests__/schema.test.ts
import {beaconBatchSchema} from '../schema';

const validEvent = {
  name: 'pageview',
  ts: '2026-07-19T12:00:00.000Z',
  siteId: 'hongsoohyuk.com',
  anonId: '9a2f4c1e-1111-4222-8333-444455556666',
  sessionId: '9a2f4c1e-7777-4888-9999-000011112222',
  url: 'https://hongsoohyuk.com/blog/1',
  referrer: 'https://www.google.com/',
  utm: {source: null, medium: null, campaign: null, term: null, content: null},
  props: {},
};

describe('beaconBatchSchema', () => {
  it('유효한 배치를 통과시킨다', () => {
    const batch = {
      sdk: {name: 'beacon', version: '0.1.0'},
      sentAt: '2026-07-19T12:00:00.000Z',
      events: [validEvent],
    };
    expect(beaconBatchSchema.safeParse(batch).success).toBe(true);
  });

  it('선택 필드가 없어도 통과한다 (name, siteId만 필수)', () => {
    const batch = {events: [{name: 'click', siteId: 'hongsoohyuk.com'}]};
    expect(beaconBatchSchema.safeParse(batch).success).toBe(true);
  });

  it('빈 events 배열은 거부한다', () => {
    expect(beaconBatchSchema.safeParse({events: []}).success).toBe(false);
  });

  it('이벤트 51개는 거부한다', () => {
    const events = Array.from({length: 51}, () => validEvent);
    expect(beaconBatchSchema.safeParse({events}).success).toBe(false);
  });

  it('이벤트 50개는 통과한다', () => {
    const events = Array.from({length: 50}, () => validEvent);
    expect(beaconBatchSchema.safeParse({events}).success).toBe(true);
  });

  it('name 누락 이벤트는 거부한다', () => {
    expect(beaconBatchSchema.safeParse({events: [{siteId: 'hongsoohyuk.com'}]}).success).toBe(false);
  });

  it('ISO가 아닌 ts는 거부한다', () => {
    const batch = {events: [{...validEvent, ts: 'yesterday'}]};
    expect(beaconBatchSchema.safeParse(batch).success).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- app/api/collect/_lib/__tests__/schema.test.ts`
Expected: FAIL — `Cannot find module '../schema'`

- [ ] **Step 3: 스키마 구현**

```ts
// app/api/collect/_lib/schema.ts
import {z} from 'zod';

const isoDatetime = z.iso.datetime({offset: true});

export const beaconEventSchema = z.object({
  name: z.string().min(1).max(64),
  siteId: z.string().min(1).max(128),
  ts: isoDatetime.optional(),
  anonId: z.string().max(64).optional(),
  sessionId: z.string().max(64).optional(),
  url: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  utm: z
    .object({
      source: z.string().max(256).nullable(),
      medium: z.string().max(256).nullable(),
      campaign: z.string().max(256).nullable(),
      term: z.string().max(256).nullable(),
      content: z.string().max(256).nullable(),
    })
    .partial()
    .optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

export const beaconBatchSchema = z.object({
  sdk: z.object({name: z.string().max(64), version: z.string().max(32)}).optional(),
  sentAt: isoDatetime.optional(),
  events: z.array(beaconEventSchema).min(1).max(50),
});

export type BeaconEvent = z.infer<typeof beaconEventSchema>;
export type BeaconBatch = z.infer<typeof beaconBatchSchema>;
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- app/api/collect/_lib/__tests__/schema.test.ts`
Expected: PASS (7 tests)

---

### Task 3: CORS + 봇 필터 헬퍼

**Files:**
- Create: `app/api/collect/_lib/http.ts`
- Test: `app/api/collect/_lib/__tests__/http.test.ts`

**Interfaces:**
- Produces: `corsHeaders(origin: string | null): Record<string, string>` (비허용 origin이면 `{}`), `isBotUserAgent(ua: string | null): boolean`. Task 4의 route가 사용.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// app/api/collect/_lib/__tests__/http.test.ts
import {corsHeaders, isBotUserAgent} from '../http';

describe('corsHeaders', () => {
  it('hongsoohyuk.com origin에 CORS 헤더를 반환한다', () => {
    const headers = corsHeaders('https://hongsoohyuk.com');
    expect(headers['Access-Control-Allow-Origin']).toBe('https://hongsoohyuk.com');
    expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type');
  });

  it('www 서브도메인과 localhost(포트 무관)를 허용한다', () => {
    expect(corsHeaders('https://www.hongsoohyuk.com')['Access-Control-Allow-Origin']).toBe(
      'https://www.hongsoohyuk.com',
    );
    expect(corsHeaders('http://localhost:3000')['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
  });

  it('허용 목록 밖 origin은 빈 객체를 반환한다', () => {
    expect(corsHeaders('https://evil.example.com')).toEqual({});
    expect(corsHeaders('https://hongsoohyuk.com.evil.com')).toEqual({});
  });

  it('origin이 없거나 URL이 아니면 빈 객체를 반환한다', () => {
    expect(corsHeaders(null)).toEqual({});
    expect(corsHeaders('not-a-url')).toEqual({});
  });
});

describe('isBotUserAgent', () => {
  it('크롤러/헤드리스 UA를 봇으로 판별한다', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 HeadlessChrome/120.0')).toBe(true);
    expect(isBotUserAgent('Chrome-Lighthouse')).toBe(true);
  });

  it('일반 브라우저와 curl은 봇이 아니다', () => {
    expect(isBotUserAgent('Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/126.0 Safari/537.36')).toBe(false);
    expect(isBotUserAgent('curl/8.6.0')).toBe(false);
    expect(isBotUserAgent(null)).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- app/api/collect/_lib/__tests__/http.test.ts`
Expected: FAIL — `Cannot find module '../http'`

- [ ] **Step 3: 구현**

```ts
// app/api/collect/_lib/http.ts
const ALLOWED_HOSTNAMES = new Set(['hongsoohyuk.com', 'www.hongsoohyuk.com', 'localhost', '127.0.0.1']);

function isAllowedOrigin(origin: string): boolean {
  try {
    return ALLOWED_HOSTNAMES.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const BOT_UA_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|phantomjs|puppeteer|playwright|scrapy|python-requests|wget/i;

export function isBotUserAgent(ua: string | null): boolean {
  return ua !== null && BOT_UA_PATTERN.test(ua);
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- app/api/collect/_lib/__tests__/http.test.ts`
Expected: PASS (6 tests)

---

### Task 4: `/api/collect` route handler

**Files:**
- Create: `app/api/collect/route.ts`
- Test: `app/api/collect/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `beaconBatchSchema`(Task 2), `corsHeaders`/`isBotUserAgent`(Task 3), `supabaseAdmin`(`src/lib/api/supabase.ts` — 기존).
- Produces: `POST /api/collect`(204/400), `OPTIONS /api/collect`(204 + CORS). DB 컬럼 매핑: `siteId→site_id`, `name→event_name`, `ts→client_ts`.
- 주의: 테스트는 `@jest-environment node` docblock 필수(기본 jsdom엔 Request/Response 없음). jest.mock 팩토리에서 참조하는 변수는 `mock` 접두사 필수(호이스팅 규칙).

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
/**
 * @jest-environment node
 */
// app/api/collect/__tests__/route.test.ts
const mockInsert = jest.fn(async () => ({error: null as {message: string} | null}));

jest.mock('@/lib/api/supabase', () => ({
  supabaseAdmin: {from: jest.fn(() => ({insert: mockInsert}))},
}));

import {OPTIONS, POST} from '../route';

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/collect', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', ...headers},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const validBatch = {
  sdk: {name: 'beacon', version: '0.1.0'},
  sentAt: '2026-07-19T12:00:00.000Z',
  events: [
    {
      name: 'pageview',
      ts: '2026-07-19T12:00:00.000Z',
      siteId: 'hongsoohyuk.com',
      anonId: 'anon-1',
      sessionId: 'sess-1',
      url: 'https://hongsoohyuk.com/blog/1',
      referrer: 'https://www.google.com/',
    },
  ],
};

beforeEach(() => {
  mockInsert.mockClear();
  mockInsert.mockResolvedValue({error: null});
});

describe('POST /api/collect', () => {
  it('유효한 배치는 204를 반환하고 snake_case로 매핑해 저장한다', async () => {
    const res = await POST(makeRequest(validBatch));
    expect(res.status).toBe(204);
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        site_id: 'hongsoohyuk.com',
        event_name: 'pageview',
        anon_id: 'anon-1',
        session_id: 'sess-1',
        url: 'https://hongsoohyuk.com/blog/1',
        referrer: 'https://www.google.com/',
        client_ts: '2026-07-19T12:00:00.000Z',
      }),
    ]);
  });

  it('JSON이 아닌 body는 400', async () => {
    const res = await POST(makeRequest('not-json'));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('스키마 위반(빈 events)은 400', async () => {
    const res = await POST(makeRequest({events: []}));
    expect(res.status).toBe(400);
  });

  it('이벤트 51개는 400', async () => {
    const events = Array.from({length: 51}, () => validBatch.events[0]);
    const res = await POST(makeRequest({events}));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('봇 UA는 저장 없이 204', async () => {
    const res = await POST(makeRequest(validBatch, {'User-Agent': 'Googlebot/2.1'}));
    expect(res.status).toBe(204);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('저장 실패여도 204 (방문자 경험 보호)', async () => {
    mockInsert.mockResolvedValue({error: {message: 'db down'}});
    const res = await POST(makeRequest(validBatch));
    expect(res.status).toBe(204);
  });

  it('허용 origin이면 응답에 CORS 헤더를 포함한다', async () => {
    const res = await POST(makeRequest(validBatch, {Origin: 'https://hongsoohyuk.com'}));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://hongsoohyuk.com');
  });
});

describe('OPTIONS /api/collect', () => {
  it('허용 origin 프리플라이트에 204 + CORS 헤더', async () => {
    const req = new Request('http://localhost:3000/api/collect', {
      method: 'OPTIONS',
      headers: {Origin: 'http://localhost:3000'},
    });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('비허용 origin에는 CORS 헤더 없음', async () => {
    const req = new Request('http://localhost:3000/api/collect', {
      method: 'OPTIONS',
      headers: {Origin: 'https://evil.example.com'},
    });
    const res = await OPTIONS(req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- app/api/collect/__tests__/route.test.ts`
Expected: FAIL — `Cannot find module '../route'`

- [ ] **Step 3: route 구현**

```ts
// app/api/collect/route.ts
import {supabaseAdmin} from '@/lib/api/supabase';
import {corsHeaders, isBotUserAgent} from './_lib/http';
import {beaconBatchSchema} from './_lib/schema';

export async function OPTIONS(req: Request) {
  return new Response(null, {status: 204, headers: corsHeaders(req.headers.get('origin'))});
}

export async function POST(req: Request) {
  const headers = corsHeaders(req.headers.get('origin'));

  if (isBotUserAgent(req.headers.get('user-agent'))) {
    return new Response(null, {status: 204, headers});
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({error: 'Invalid JSON'}, {status: 400, headers});
  }

  const parsed = beaconBatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({error: 'Invalid payload'}, {status: 400, headers});
  }

  const rows = parsed.data.events.map((ev) => ({
    site_id: ev.siteId,
    event_name: ev.name,
    anon_id: ev.anonId ?? null,
    session_id: ev.sessionId ?? null,
    url: ev.url ?? null,
    referrer: ev.referrer ?? null,
    utm: ev.utm ?? null,
    props: ev.props ?? null,
    client_ts: ev.ts ?? null,
  }));

  const {error} = await supabaseAdmin.from('beacon_events').insert(rows);
  if (error) {
    console.error('[collect] insert failed:', error.message);
  }

  return new Response(null, {status: 204, headers});
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- app/api/collect/__tests__/route.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: S1 live 검증 (checkpoint — Task 1 SQL 실행 + 사용자 dev 서버 필요)**

사용자 dev 서버(:3000)가 떠 있는 상태에서:

```bash
curl -i -X POST http://localhost:3000/api/collect \
  -H 'Content-Type: application/json' \
  -d '{"sdk":{"name":"beacon","version":"0.1.0"},"sentAt":"2026-07-19T12:00:00.000Z","events":[{"name":"pageview","ts":"2026-07-19T12:00:00.000Z","siteId":"hongsoohyuk.com","anonId":"test-anon","sessionId":"test-sess","url":"https://hongsoohyuk.com/blog/1","referrer":"https://www.google.com/"}]}'
```

Expected: `HTTP/1.1 204 No Content`, Supabase Table Editor에서 `beacon_events`에 row 1개 확인. **S1 완료.**

---

### Task 5: /stats 데이터 페처 (`_lib/queries.ts`)

**Files:**
- Create: `app/[locale]/stats/_lib/queries.ts`
- Test: `app/[locale]/stats/_lib/__tests__/queries.test.ts`

**Interfaces:**
- Consumes: Task 1의 RPC 함수 5개, `supabaseAdmin`.
- Produces:
  - `parsePeriod(value: string | undefined): StatsPeriod` — `'30'`→30, 그 외→7
  - `fetchStats(days: StatsPeriod): Promise<BeaconStats>` — 테스트용 비캐시 원본
  - `getStats = unstable_cache(fetchStats, ['beacon-stats'], {revalidate: 300})` — 페이지가 사용
  - 타입: `StatsPeriod = 7 | 30`, `StatsSummary {pageviews, visitors, sessions, clicks: number}`, `DailyPageviews {day: string; pv: number}`, `TrafficSource {source: string; sessions: number}`, `TopPage {path: string; pv: number}`, `VitalStat {metric: string; p75: number; good: number; needs_improvement: number; poor: number; total: number}`, `BeaconStats {summary, daily, sources, pages, vitals}`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
/**
 * @jest-environment node
 */
// app/[locale]/stats/_lib/__tests__/queries.test.ts
const mockRpc = jest.fn();

jest.mock('@/lib/api/supabase', () => ({
  supabaseAdmin: {rpc: mockRpc},
}));

import {fetchStats, parsePeriod} from '../queries';

describe('parsePeriod', () => {
  it("'30'만 30, 그 외는 전부 7", () => {
    expect(parsePeriod('30')).toBe(30);
    expect(parsePeriod('7')).toBe(7);
    expect(parsePeriod(undefined)).toBe(7);
    expect(parsePeriod('999')).toBe(7);
  });
});

describe('fetchStats', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockRpc.mockImplementation(async (fn: string) => {
      const data = {
        beacon_summary: [{pageviews: 10, visitors: 3, sessions: 4, clicks: 2}],
        beacon_daily_pageviews: [{day: '2026-07-19', pv: 10}],
        beacon_top_sources: [{source: 'direct', sessions: 4}],
        beacon_top_pages: [{path: '/blog/1', pv: 6}],
        beacon_vitals: [{metric: 'LCP', p75: 1800, good: 8, needs_improvement: 1, poor: 1, total: 10}],
      }[fn];
      return {data, error: null};
    });
  });

  it('RPC 5개를 site_id/기간 인자로 호출해 합성한다', async () => {
    const stats = await fetchStats(7);
    expect(mockRpc).toHaveBeenCalledWith('beacon_summary', {p_site_id: 'hongsoohyuk.com', p_days: 7});
    expect(mockRpc).toHaveBeenCalledWith('beacon_top_sources', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(mockRpc).toHaveBeenCalledWith('beacon_top_pages', {p_site_id: 'hongsoohyuk.com', p_days: 7, p_limit: 10});
    expect(stats.summary.pageviews).toBe(10);
    expect(stats.daily).toHaveLength(1);
    expect(stats.vitals[0].metric).toBe('LCP');
  });

  it('summary가 빈 결과면 0으로 채운다', async () => {
    mockRpc.mockResolvedValue({data: [], error: null});
    const stats = await fetchStats(30);
    expect(stats.summary).toEqual({pageviews: 0, visitors: 0, sessions: 0, clicks: 0});
  });

  it('RPC 에러는 throw한다', async () => {
    mockRpc.mockResolvedValue({data: null, error: {message: 'missing function'}});
    await expect(fetchStats(7)).rejects.toThrow('beacon_summary');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- "app/[locale]/stats/_lib/__tests__/queries.test.ts"`
Expected: FAIL — `Cannot find module '../queries'`

- [ ] **Step 3: 구현**

```ts
// app/[locale]/stats/_lib/queries.ts
import {unstable_cache} from 'next/cache';
import {supabaseAdmin} from '@/lib/api/supabase';

export const STATS_SITE_ID = 'hongsoohyuk.com';

export type StatsPeriod = 7 | 30;

export type StatsSummary = {pageviews: number; visitors: number; sessions: number; clicks: number};
export type DailyPageviews = {day: string; pv: number};
export type TrafficSource = {source: string; sessions: number};
export type TopPage = {path: string; pv: number};
export type VitalStat = {
  metric: string;
  p75: number;
  good: number;
  needs_improvement: number;
  poor: number;
  total: number;
};

export type BeaconStats = {
  summary: StatsSummary;
  daily: DailyPageviews[];
  sources: TrafficSource[];
  pages: TopPage[];
  vitals: VitalStat[];
};

const EMPTY_SUMMARY: StatsSummary = {pageviews: 0, visitors: 0, sessions: 0, clicks: 0};

export function parsePeriod(value: string | undefined): StatsPeriod {
  return value === '30' ? 30 : 7;
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const {data, error} = await supabaseAdmin.rpc(fn, args);
  if (error) throw new Error(`[stats] ${fn}: ${error.message}`);
  return data as T;
}

export async function fetchStats(days: StatsPeriod): Promise<BeaconStats> {
  const base = {p_site_id: STATS_SITE_ID, p_days: days};
  const [summaryRows, daily, sources, pages, vitals] = await Promise.all([
    rpc<StatsSummary[]>('beacon_summary', base),
    rpc<DailyPageviews[]>('beacon_daily_pageviews', base),
    rpc<TrafficSource[]>('beacon_top_sources', {...base, p_limit: 10}),
    rpc<TopPage[]>('beacon_top_pages', {...base, p_limit: 10}),
    rpc<VitalStat[]>('beacon_vitals', base),
  ]);
  return {summary: summaryRows[0] ?? EMPTY_SUMMARY, daily, sources, pages, vitals};
}

// searchParams 사용으로 페이지가 동적 렌더되므로 세그먼트 revalidate 대신 데이터 캐시로 5분 처리
export const getStats = unstable_cache(fetchStats, ['beacon-stats'], {revalidate: 300});
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- "app/[locale]/stats/_lib/__tests__/queries.test.ts"`
Expected: PASS (5 tests)

---

### Task 6: vitals 포맷/시리즈 헬퍼

**Files:**
- Create: `app/[locale]/stats/_lib/format.ts`
- Test: `app/[locale]/stats/_lib/__tests__/format.test.ts`

**Interfaces:**
- Consumes: Task 5의 타입 `DailyPageviews`, `VitalStat`.
- Produces (Task 7 컴포넌트가 사용):
  - `formatVitalValue(metric: string, value: number): string` — CLS는 소수 3자리, 나머지는 1000ms 이상 `X.XXs` / 미만 `Nms`
  - `ratingPercents(v: Pick<VitalStat, 'good' | 'needs_improvement' | 'poor' | 'total'>): {good: number; needsImprovement: number; poor: number}` (정수 %)
  - `sortVitals<T extends {metric: string}>(vitals: T[]): T[]` — LCP, CLS, TTFB, INP 순
  - `fillDailySeries(rows: DailyPageviews[], days: number, todayIso?: string): DailyPageviews[]` — 빠진 날짜 0으로 채워 `days`개 반환 (KST 오늘 기준)
- 참고: good/needs-improvement/poor 판정 임계값(LCP 2.5s/4s 등)은 SDK가 `props.rating`으로 이미 계산해 보내므로 서버에서 재계산하지 않는다.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// app/[locale]/stats/_lib/__tests__/format.test.ts
import {fillDailySeries, formatVitalValue, ratingPercents, sortVitals} from '../format';

describe('formatVitalValue', () => {
  it('CLS는 소수 3자리', () => {
    expect(formatVitalValue('CLS', 0.0512)).toBe('0.051');
  });

  it('1000ms 이상은 초 단위 2자리', () => {
    expect(formatVitalValue('LCP', 1850)).toBe('1.85s');
  });

  it('1000ms 미만은 ms 정수', () => {
    expect(formatVitalValue('TTFB', 320.6)).toBe('321ms');
  });
});

describe('ratingPercents', () => {
  it('정수 퍼센트로 변환한다', () => {
    expect(ratingPercents({good: 8, needs_improvement: 1, poor: 1, total: 10})).toEqual({
      good: 80,
      needsImprovement: 10,
      poor: 10,
    });
  });

  it('total 0이면 전부 0', () => {
    expect(ratingPercents({good: 0, needs_improvement: 0, poor: 0, total: 0})).toEqual({
      good: 0,
      needsImprovement: 0,
      poor: 0,
    });
  });
});

describe('sortVitals', () => {
  it('LCP, CLS, TTFB, INP 순으로 정렬하고 미지 metric은 뒤로 보낸다', () => {
    const input = [{metric: 'FCP'}, {metric: 'TTFB'}, {metric: 'LCP'}, {metric: 'CLS'}];
    expect(sortVitals(input).map((v) => v.metric)).toEqual(['LCP', 'CLS', 'TTFB', 'FCP']);
  });
});

describe('fillDailySeries', () => {
  it('빠진 날짜를 0으로 채워 days개를 반환한다', () => {
    const rows = [{day: '2026-07-18', pv: 5}];
    const series = fillDailySeries(rows, 3, '2026-07-19');
    expect(series).toEqual([
      {day: '2026-07-17', pv: 0},
      {day: '2026-07-18', pv: 5},
      {day: '2026-07-19', pv: 0},
    ]);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- "app/[locale]/stats/_lib/__tests__/format.test.ts"`
Expected: FAIL — `Cannot find module '../format'`

- [ ] **Step 3: 구현**

```ts
// app/[locale]/stats/_lib/format.ts
import type {DailyPageviews, VitalStat} from './queries';

const VITAL_ORDER = ['LCP', 'CLS', 'TTFB', 'INP'];

export function formatVitalValue(metric: string, value: number): string {
  if (metric === 'CLS') return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

export function ratingPercents(v: Pick<VitalStat, 'good' | 'needs_improvement' | 'poor' | 'total'>) {
  if (v.total === 0) return {good: 0, needsImprovement: 0, poor: 0};
  return {
    good: Math.round((v.good / v.total) * 100),
    needsImprovement: Math.round((v.needs_improvement / v.total) * 100),
    poor: Math.round((v.poor / v.total) * 100),
  };
}

export function sortVitals<T extends {metric: string}>(vitals: T[]): T[] {
  const rank = (metric: string) => {
    const index = VITAL_ORDER.indexOf(metric);
    return index === -1 ? VITAL_ORDER.length : index;
  };
  return [...vitals].sort((a, b) => rank(a.metric) - rank(b.metric));
}

export function fillDailySeries(rows: DailyPageviews[], days: number, todayIso?: string): DailyPageviews[] {
  const today = todayIso ?? new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Seoul'});
  const byDay = new Map(rows.map((r) => [r.day, r.pv]));
  const end = new Date(`${today}T00:00:00Z`);
  const series: DailyPageviews[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    series.push({day: iso, pv: byDay.get(iso) ?? 0});
  }
  return series;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- "app/[locale]/stats/_lib/__tests__/format.test.ts"`
Expected: PASS (7 tests)

---

### Task 7: /stats 페이지 + 컴포넌트 + 메시지

**Files:**
- Create: `app/[locale]/stats/page.tsx`
- Create: `app/[locale]/stats/_components/stat-card.tsx`
- Create: `app/[locale]/stats/_components/daily-chart.tsx`
- Create: `app/[locale]/stats/_components/rank-list.tsx`
- Create: `app/[locale]/stats/_components/vitals-panel.tsx`
- Modify: `messages/ko.json` (최상위에 `"Stats"` 네임스페이스 추가)
- Modify: `messages/en.json` (동일)

**Interfaces:**
- Consumes: Task 5 `getStats`/`parsePeriod`/타입, Task 6 헬퍼 전부, `Link`(`@/lib/i18n/routing`), `getTranslations`/`setRequestLocale`(`next-intl/server`).
- 전 컴포넌트 서버 컴포넌트(`'use client'` 없음), 차트는 CSS 막대.

- [ ] **Step 1: 메시지 추가**

`messages/ko.json` 최상위(예: `"Common"` 위)에:

```json
"Stats": {
  "title": "지표",
  "description": "hongsoohyuk.com 방문·성능 공개 지표",
  "period7": "최근 7일",
  "period30": "최근 30일",
  "pageviews": "페이지뷰",
  "visitors": "방문자",
  "sessions": "세션",
  "clicks": "클릭",
  "dailyTrend": "일별 페이지뷰",
  "sources": "유입 경로",
  "topPages": "인기 페이지",
  "vitals": "Web Vitals",
  "empty": "아직 수집된 데이터가 없습니다",
  "p75Note": "* Web Vitals 수치는 평균이 아닌 75퍼센타일(p75)입니다 — 방문의 75%가 이 값보다 나은 경험을 했다는 의미로, web.dev 표준 측정 방식입니다.",
  "privacyNote": "* 추적 쿠키와 IP 주소를 수집하지 않으며, 익명 집계 수치만 표시합니다."
}
```

`messages/en.json` 최상위에:

```json
"Stats": {
  "title": "Stats",
  "description": "Public traffic & performance metrics for hongsoohyuk.com",
  "period7": "Last 7 days",
  "period30": "Last 30 days",
  "pageviews": "Pageviews",
  "visitors": "Visitors",
  "sessions": "Sessions",
  "clicks": "Clicks",
  "dailyTrend": "Daily pageviews",
  "sources": "Traffic sources",
  "topPages": "Top pages",
  "vitals": "Web Vitals",
  "empty": "No data collected yet",
  "p75Note": "* Web Vitals values are the 75th percentile (p75), not averages — 75% of visits had a better experience than this value, per the web.dev standard.",
  "privacyNote": "* No tracking cookies, no IP addresses stored — only anonymous aggregates are shown."
}
```

- [ ] **Step 2: 컴포넌트 4개 작성**

```tsx
// app/[locale]/stats/_components/stat-card.tsx
type Props = {label: string; value: number};

export function StatCard({label, value}: Props) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}
```

```tsx
// app/[locale]/stats/_components/daily-chart.tsx
import type {DailyPageviews} from '../_lib/queries';

type Props = {data: DailyPageviews[]; emptyLabel: string};

export function DailyChart({data, emptyLabel}: Props) {
  const max = Math.max(...data.map((d) => d.pv), 0);
  if (max === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  return (
    <div>
      <div className="flex h-40 items-end gap-px sm:gap-1">
        {data.map((d) => (
          <div
            key={d.day}
            title={`${d.day} · ${d.pv.toLocaleString()}`}
            className="min-w-0 flex-1 rounded-t bg-primary/70 hover:bg-primary"
            style={{height: `${Math.max((d.pv / max) * 100, d.pv > 0 ? 3 : 1)}%`}}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}
```

```tsx
// app/[locale]/stats/_components/rank-list.tsx
type Item = {label: string; value: number};
type Props = {items: Item[]; emptyLabel: string};

export function RankList({items, emptyLabel}: Props) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  const max = Math.max(...items.map((i) => i.value));

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="relative overflow-hidden rounded">
          <div className="absolute inset-y-0 left-0 bg-muted" style={{width: `${(item.value / max) * 100}%`}} />
          <div className="relative flex items-center justify-between gap-2 px-2 py-1 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="tabular-nums text-muted-foreground">{item.value.toLocaleString()}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// app/[locale]/stats/_components/vitals-panel.tsx
import {formatVitalValue, ratingPercents, sortVitals} from '../_lib/format';
import type {VitalStat} from '../_lib/queries';

type Props = {vitals: VitalStat[]; emptyLabel: string};

export function VitalsPanel({vitals, emptyLabel}: Props) {
  if (vitals.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sortVitals(vitals).map((vital) => {
        const pct = ratingPercents(vital);
        return (
          <div key={vital.metric} className="rounded-lg border p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{vital.metric}</span>
              <span className="text-xl font-semibold tabular-nums">
                {formatVitalValue(vital.metric, vital.p75)}
              </span>
            </div>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
              <div className="bg-emerald-500" style={{width: `${pct.good}%`}} />
              <div className="bg-amber-500" style={{width: `${pct.needsImprovement}%`}} />
              <div className="bg-red-500" style={{width: `${pct.poor}%`}} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              good {pct.good}% · ni {pct.needsImprovement}% · poor {pct.poor}%
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: 페이지 작성**

```tsx
// app/[locale]/stats/page.tsx
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/routing';
import {DailyChart} from './_components/daily-chart';
import {RankList} from './_components/rank-list';
import {StatCard} from './_components/stat-card';
import {VitalsPanel} from './_components/vitals-panel';
import {fillDailySeries} from './_lib/format';
import {getStats, parsePeriod, type BeaconStats, type StatsPeriod} from './_lib/queries';
import type {Metadata} from 'next';

const EMPTY_STATS: BeaconStats = {
  summary: {pageviews: 0, visitors: 0, sessions: 0, clicks: 0},
  daily: [],
  sources: [],
  pages: [],
  vitals: [],
};

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{days?: string}>;
};

export async function generateMetadata({params}: Pick<Props, 'params'>): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Stats'});
  return {title: t('title'), description: t('description')};
}

export default async function StatsPage({params, searchParams}: Props) {
  const [{locale}, {days}] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const period = parsePeriod(days);
  const t = await getTranslations('Stats');

  let stats: BeaconStats;
  try {
    stats = await getStats(period);
  } catch (error) {
    console.error('[stats] fetch failed:', error);
    stats = EMPTY_STATS;
  }

  const daily = fillDailySeries(stats.daily, period);
  const periods: StatsPeriod[] = [7, 30];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <nav className="flex gap-1 rounded-lg border p-0.5 text-sm">
          {periods.map((d) => (
            <Link
              key={d}
              href={d === 7 ? '/stats' : {pathname: '/stats', query: {days: d}}}
              className={`rounded-md px-3 py-1 ${period === d ? 'bg-muted font-medium' : 'text-muted-foreground'}`}
            >
              {t(`period${d}`)}
            </Link>
          ))}
        </nav>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t('pageviews')} value={stats.summary.pageviews} />
        <StatCard label={t('visitors')} value={stats.summary.visitors} />
        <StatCard label={t('sessions')} value={stats.summary.sessions} />
        <StatCard label={t('clicks')} value={stats.summary.clicks} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('dailyTrend')}</h2>
        <DailyChart data={daily} emptyLabel={t('empty')} />
      </section>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('sources')}</h2>
          <RankList
            items={stats.sources.map((s) => ({label: s.source, value: s.sessions}))}
            emptyLabel={t('empty')}
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('topPages')}</h2>
          <RankList items={stats.pages.map((p) => ({label: p.path, value: p.pv}))} emptyLabel={t('empty')} />
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('vitals')}</h2>
        <VitalsPanel vitals={stats.vitals} emptyLabel={t('empty')} />
      </section>

      <footer className="mt-10 space-y-1 border-t pt-4 text-xs text-muted-foreground">
        <p>{t('p75Note')}</p>
        <p>{t('privacyNote')}</p>
      </footer>
    </main>
  );
}
```

주의: `t(\`period${d}\`)`는 next-intl 타입상 동적 키 — 오류 나면 `t(d === 7 ? 'period7' : 'period30')`으로 교체.

- [ ] **Step 4: 전체 검증**

Run: `pnpm test` → 전체 PASS (기존 + 신규)
Run: `pnpm lint` → 에러 0

- [ ] **Step 5: S3 live 검증 (checkpoint — 사용자 dev 서버 필요)**

```bash
curl -s http://localhost:3000/stats | grep -o '<h1[^>]*>[^<]*</h1>'
curl -s "http://localhost:3000/stats?days=30" -o /dev/null -w '%{http_code}\n'
curl -s http://localhost:3000/en/stats -o /dev/null -w '%{http_code}\n'
```

Expected: h1에 "지표", 두 요청 모두 200. Task 1 SQL이 실행돼 있고 curl로 넣은 테스트 이벤트가 있으면 카드에 수치 렌더. 이후 Vercel 배포본에서 공개 접근 확인되면 **S3 완료.**

---

### Task 8: SDK 설치 (S2) — ⏸ BLOCKED: SDK 저장소 선행 필요

**전제조건 (이 저장소 밖, `~/dev/toy/beacon`):** 현재 SDK는 `src/types.ts`, `core/{uuid,context,session}.ts`만 있고 `index.ts`(`init`), `vitals` 플러그인, 빌드 설정이 없다. SDK 저장소에서 ① `init`/`webVitals` 구현 ② `exports` 맵(`.` + `./vitals`) + 빌드 ③ `pnpm pack`으로 tarball 생성이 끝나야 이 태스크를 실행할 수 있다.

**Files:**
- Create: `vendor/hongsoohyuk-beacon-0.1.0.tgz` (tarball 복사본 — Vercel 빌드에서 `file:` 의존성이 저장소 밖을 참조할 수 없으므로 repo 안에 vendoring; npm 배포 후 버전 의존성으로 교체하고 삭제)
- Create: `src/components/layout/beacon-provider.tsx`
- Modify: `app/[locale]/layout.tsx` (`<Analytics />` 아래에 `<BeaconProvider />` 마운트)
- Modify: `package.json` (`"@hongsoohyuk/beacon": "file:./vendor/hongsoohyuk-beacon-0.1.0.tgz"`)

**Interfaces:**
- Consumes: `init(options)` from `@hongsoohyuk/beacon`, `webVitals()` from `@hongsoohyuk/beacon/vitals` (스펙 문서 §3 API).

- [ ] **Step 1: tarball vendoring + 설치**

```bash
cp ~/dev/toy/beacon/packages/sdk/hongsoohyuk-beacon-0.1.0.tgz vendor/
pnpm add file:./vendor/hongsoohyuk-beacon-0.1.0.tgz
```

- [ ] **Step 2: BeaconProvider 작성**

```tsx
// src/components/layout/beacon-provider.tsx
'use client';

import {useEffect} from 'react';
import {init} from '@hongsoohyuk/beacon';
import {webVitals} from '@hongsoohyuk/beacon/vitals';

let initialized = false;

export function BeaconProvider() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    init({
      endpoint: '/api/collect',
      siteId: 'hongsoohyuk.com',
      autoPageview: true,
      autoClick: true,
      plugins: [webVitals()],
    });
  }, []);

  return null;
}
```

- [ ] **Step 3: 루트 레이아웃 마운트**

`app/[locale]/layout.tsx`의 `<Analytics />` 위에 한 줄 추가:

```tsx
import {BeaconProvider} from '@/components/layout/beacon-provider';
// ...
        <BeaconProvider />
        <Analytics />
```

- [ ] **Step 4: 주요 클릭 지점에 `data-beacon-event` 어노테이션**

블로그 글 카드(`app/[locale]/(content)/` 하위 blog 카드 컴포넌트), 이력서 다운로드 링크(resume 라우트), Footer 외부 링크(`src/components/layout/footer.tsx`)를 grep으로 찾아 각각 `data-beacon-event="blog-card"`, `data-beacon-event="resume-download"`, `data-beacon-event="external-link"` 속성 추가. (SDK autoClick이 이 속성을 이벤트 이름으로 사용 — SDK 확정 스펙에 맞춰 조정.)

- [ ] **Step 5: 검증 (checkpoint — 사용자 dev 서버 필요)**

사용자 브라우저에서 페이지 2~3개 이동 + 클릭 → Supabase `beacon_events`에 `pageview`/`click`/`vital` row가 쌓이는지 Table Editor에서 확인. `pnpm test`, `pnpm lint` 통과 확인. 배포 후 실트래픽이 쌓이면 **S2 완료.**
