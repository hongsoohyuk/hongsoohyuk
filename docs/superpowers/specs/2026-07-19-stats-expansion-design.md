# /stats 지표 확장 설계

2026-07-19 브레인스토밍 결과. 배경: S1~S3 배포 완료 후 사용자 요청 — "유의미한 지표 추가 + 그래프 보강 + **일자별로 어떤 페이지에 들어갔는지**(Vercel Analytics가 안 보여주는 것)".

## 범위

사용자 선택: **콘텐츠/유입 심화 + 성능 심화 + 일별 페이지 분해**. 구조는 **원페이지 확장**(탭 없음), 차트는 전부 **서버 렌더 SVG/CSS — 클라이언트 JS 0 유지**.

제외(이번에 안 함): 방문자 행동 그룹(이탈률/신규·재방문), 요일×시간 히트맵, 디바이스/브라우저(SDK 확장 필요), 차트 라이브러리 도입.

## 페이지 구성 (위→아래)

1. 요약 카드 4개 — 유지
2. 일별 페이지뷰 막대 — 유지
3. **일별 페이지 히트맵** (신규): 페이지(행, top 10) × 날짜(열) 그리드. 셀 농도 = 그 날 PV, 셀 `title`에 정확한 수치. 30일은 `overflow-x-auto` 가로 스크롤. 모바일에서도 세로 스크롤 없이 읽히게 행 10개 고정.
4. 유입 섹션: **유입 소스 일별 추이 멀티 라인 차트**(신규, top 5 소스 + 범례) + 기존 유입 경로 순위(유지)
5. **랜딩 / 종료 페이지** (신규): RankList 2개 나란히 (sm 이상 2열)
6. **블로그 글 순위** (신규): `/blog/*`만 필터한 조회 순위
7. Web Vitals 카드 — **일별 p75 스파크라인 삽입** (업그레이드). INP는 SDK가 보내기 시작하면 자동 표시(기존 대응 유지).
8. **워스트 LCP 페이지 top 5** (신규): 표본 3개 미만 페이지는 제외(노이즈)
9. 각주(p75/프라이버시) — 유지

## Path 정규화 (공통 규칙)

URL → path 추출 후 locale prefix 통합: `regexp_replace(path, '^/en(/|$)', '/')`. `/en/blog/1`과 `/blog/1`은 같은 페이지로 합산. **기존 `beacon_top_pages`도 이 규칙으로 교체**(시그니처 동일, create or replace).

## 신규 Supabase RPC 7개 (+기존 1개 교체)

`supabase/beacon.sql`에 추가하고 SQL Editor 재실행 1회 (사용자). 모두 `language sql stable`, anon/authenticated EXECUTE revoke + service_role grant — 기존 함수와 동일 정책.

| 함수 | 시그니처 | 반환 |
|---|---|---|
| `beacon_page_daily` | `(p_site_id text, p_days int, p_limit int)` | `(day date, path text, pv bigint)` — 기간 합산 top N 페이지의 일별 분해 |
| `beacon_source_daily` | `(p_site_id text, p_days int, p_limit int)` | `(day date, source text, sessions bigint)` — 기간 합산 top N 소스의 일별 세션 |
| `beacon_landing_pages` | `(p_site_id text, p_days int, p_limit int)` | `(path text, sessions bigint)` — 세션별 시간순 첫 pageview |
| `beacon_exit_pages` | `(p_site_id text, p_days int, p_limit int)` | `(path text, sessions bigint)` — 세션별 시간순 마지막 pageview |
| `beacon_top_blog_posts` | `(p_site_id text, p_days int, p_limit int)` | `(path text, pv bigint)` — 정규화 path `like '/blog/%'` |
| `beacon_vitals_daily` | `(p_site_id text, p_days int)` | `(day date, metric text, p75 numeric)` |
| `beacon_worst_lcp_pages` | `(p_site_id text, p_days int, p_limit int)` | `(path text, p75 numeric, samples bigint)` — `having count(*) >= 3`, p75 내림차순 |

세션 내 순서 판정은 `coalesce(client_ts, received_at)` 기준(SDK는 ts를 항상 보내지만 스키마상 optional). 날짜 버킷은 기존과 동일하게 KST(`at time zone 'Asia/Seoul'`).

## 컴포넌트 (전부 서버 컴포넌트, `_components/`)

- `sparkline.tsx` — `{points: number[]}` → 작은 SVG polyline (vitals 카드 내부, 장식용 `aria-hidden`)
- `line-chart.tsx` — `{series: Array<{label: string; points: Array<{day: string; value: number}>}>}` → SVG 멀티 polyline + 하단 범례. y 스케일 자동.
- `page-day-heatmap.tsx` — `{days: string[]; rows: Array<{path: string; cells: number[]}>}` → `<table>` + 셀 배경 opacity(=value/max), `overflow-x-auto` 래퍼
- 색상/접근성(콘트라스트, 컬러 시스템)은 구현 시 dataviz 스킬 로드 후 확정. 다크/라이트 테마 모두 기존 토큰(`primary`/`muted`) 기반.

## 데이터 레이어

- `queries.ts`: `BeaconStats`에 `pageDaily`, `sourceDaily`, `landing`, `exit`, `blogPosts`, `vitalsDaily`, `worstLcp` 추가. `fetchStats`에서 기존 5개 + 신규 7개 RPC를 `Promise.all` 병렬 호출. `unstable_cache(revalidate: 300)` 유지 — 페이지당 RPC 12개지만 5분에 1회.
- 히트맵/라인차트용 피벗(rows×days 매트릭스, 결측일 0 채움)은 `format.ts`에 순수 함수로 추가 — `pivotPageDaily(rows, days, todayIso?)`, `pivotSeriesDaily(rows, days, todayIso?)` — 기존 `fillDailySeries` 패턴 재사용, 단위 테스트 대상.

## 외부 의존 (독립 트랙 — 이 작업을 막지 않음)

SDK 저장소(`~/dev/toy/beacon`)에 INP 수집 추가 요청. 요청 명세는 브레인스토밍 기록 참조(vitals 플러그인에 onINP, 기존 3종과 동일한 `{metric, value, rating}` props 포맷, pagehide flush 보장). 사이트 쪽은 변경 불필요 — INP 이벤트가 오면 vitals 패널·스파크라인에 자동 표시된다.

## 완료 기준

- 신규 RPC가 실데이터로 응답하고 /stats가 확장 섹션 전부 렌더 (SQL 재실행 후)
- 피벗/포맷 순수 함수 단위 테스트 통과, 기존 테스트 전부 통과, lint 0 에러
- 배포 후 www.hongsoohyuk.com/stats에서 확인
