import {unstable_cache} from 'next/cache';
import {supabaseAdmin} from '@/lib/api/supabase';

export const STATS_SITE_ID = 'hongsoohyuk.com';
/** /stats?site= 로 볼 수 있는 사이트. 목록 밖 값은 기본 사이트로 돌린다 */
export const STATS_SITES = [STATS_SITE_ID, 'mega-bobs'] as const;
export const MEGA_BOBS_SITE_ID = 'mega-bobs';

export type StatsSite = (typeof STATS_SITES)[number];

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
/** 메가밥스 Slack 슬래시 커맨드 일별 호출 수와 메뉴 캐시 적중 수 */
export type SlackDailyRow = {day: string; calls: number; hits: number};

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
  slackDaily: SlackDailyRow[];
};

const EMPTY_SUMMARY: StatsSummary = {pageviews: 0, visitors: 0, sessions: 0, clicks: 0};

export function parsePeriod(value: string | undefined): StatsPeriod {
  return value === '30' ? 30 : 7;
}

export function parseSite(value: string | undefined): StatsSite {
  return STATS_SITES.find((site) => site === value) ?? STATS_SITE_ID;
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const {data, error} = await supabaseAdmin.rpc(fn, args);
  if (error) throw new Error(`[stats] ${fn}: ${error.message}`);
  return data as T;
}

// 슬랙 집계 RPC가 아직 생성되지 않았어도 나머지 지표는 보여준다
async function fetchSlackDaily(site: StatsSite, base: Record<string, unknown>): Promise<SlackDailyRow[]> {
  if (site !== MEGA_BOBS_SITE_ID) return [];
  try {
    return await rpc<SlackDailyRow[]>('beacon_slack_daily', base);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchStats(days: StatsPeriod, site: StatsSite = STATS_SITE_ID): Promise<BeaconStats> {
  const base = {p_site_id: site, p_days: days};
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
    slackDaily,
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
    fetchSlackDaily(site, base),
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
    slackDaily,
  };
}

// searchParams 사용으로 페이지가 동적 렌더되므로 세그먼트 revalidate 대신 데이터 캐시로 5분 처리
export const getStats = unstable_cache(fetchStats, ['beacon-stats'], {revalidate: 300});
