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
