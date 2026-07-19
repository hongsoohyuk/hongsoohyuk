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

-- URL → path 추출 + locale prefix 통합 (/en/blog/1 == /blog/1)
create or replace function beacon_norm_path(p_url text)
returns text
language sql immutable as $$
  select regexp_replace(coalesce(substring(p_url from '//[^/]+(/[^?#]*)'), '/'), '^/en(/|$)', '/');
$$;

-- 집계 윈도우 시작점: KST 달력일 기준 '오늘 포함 최근 p_days일'의 자정
-- (롤링 now()-N일 윈도우는 일별 차트의 달력일 도메인과 어긋나 경계일 데이터가 유실됨)
create or replace function beacon_window_start(p_days int)
returns timestamptz
language sql stable as $$
  select (date_trunc('day', now() at time zone 'Asia/Seoul') - make_interval(days => p_days - 1)) at time zone 'Asia/Seoul';
$$;

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
    and received_at >= beacon_window_start(p_days);
$$;

-- 일별 페이지뷰 (KST 기준 날짜)
create or replace function beacon_daily_pageviews(p_site_id text, p_days int)
returns table (day date, pv bigint)
language sql stable as $$
  select (received_at at time zone 'Asia/Seoul')::date, count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at >= beacon_window_start(p_days)
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
    and received_at >= beacon_window_start(p_days)
  group by 1 order by 2 desc limit p_limit;
$$;

-- 인기 페이지: URL path별 페이지뷰
create or replace function beacon_top_pages(p_site_id text, p_days int, p_limit int)
returns table (path text, pv bigint)
language sql stable as $$
  select beacon_norm_path(url), count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at >= beacon_window_start(p_days)
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
    and received_at >= beacon_window_start(p_days)
    and props->>'metric' is not null
    and props->>'value' ~ '^[0-9]+\.?[0-9]*$'
  group by 1;
$$;

-- 일별 페이지 분해: 기간 합산 top N 페이지의 날짜별 PV (히트맵용)
create or replace function beacon_page_daily(p_site_id text, p_days int, p_limit int)
returns table (day date, path text, pv bigint)
language sql stable as $$
  with top_paths as (
    select beacon_norm_path(url) as path
    from beacon_events
    where site_id = p_site_id and event_name = 'pageview'
      and received_at >= beacon_window_start(p_days)
    group by 1 order by count(*) desc limit p_limit
  )
  select (received_at at time zone 'Asia/Seoul')::date,
         beacon_norm_path(url),
         count(*)
  from beacon_events
  where site_id = p_site_id and event_name = 'pageview'
    and received_at >= beacon_window_start(p_days)
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
      and received_at >= beacon_window_start(p_days)
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
      and received_at >= beacon_window_start(p_days)
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
      and received_at >= beacon_window_start(p_days)
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
    and received_at >= beacon_window_start(p_days)
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
    and received_at >= beacon_window_start(p_days)
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
    and received_at >= beacon_window_start(p_days)
  group by 1 having count(*) >= 3
  order by 2 desc limit p_limit;
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
revoke execute on function beacon_norm_path(text) from public, anon, authenticated;
revoke execute on function beacon_window_start(int) from public, anon, authenticated;
revoke execute on function beacon_page_daily(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_source_daily(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_landing_pages(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_exit_pages(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_top_blog_posts(text, int, int) from public, anon, authenticated;
revoke execute on function beacon_vitals_daily(text, int) from public, anon, authenticated;
revoke execute on function beacon_worst_lcp_pages(text, int, int) from public, anon, authenticated;
grant execute on function beacon_norm_path(text) to service_role;
grant execute on function beacon_window_start(int) to service_role;
grant execute on function beacon_page_daily(text, int, int) to service_role;
grant execute on function beacon_source_daily(text, int, int) to service_role;
grant execute on function beacon_landing_pages(text, int, int) to service_role;
grant execute on function beacon_exit_pages(text, int, int) to service_role;
grant execute on function beacon_top_blog_posts(text, int, int) to service_role;
grant execute on function beacon_vitals_daily(text, int) to service_role;
grant execute on function beacon_worst_lcp_pages(text, int, int) to service_role;
