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
  const [
    summaryRows,
    daily,
    sources,
    pages,
    vitals,
    pageDaily,
    sourceDaily,
    landing,
    exit,
    blogPosts,
    vitalsDaily,
    worstLcp,
  ] = await Promise.all([
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
  return {
    summary: summaryRows[0] ?? EMPTY_SUMMARY,
    daily,
    sources,
    pages,
    vitals,
    pageDaily,
    sourceDaily,
    landing,
    exit,
    blogPosts,
    vitalsDaily,
    worstLcp,
  };
}

// searchParams 사용으로 페이지가 동적 렌더되므로 세그먼트 revalidate 대신 데이터 캐시로 5분 처리
export const getStats = unstable_cache(fetchStats, ['beacon-stats'], {revalidate: 300});
