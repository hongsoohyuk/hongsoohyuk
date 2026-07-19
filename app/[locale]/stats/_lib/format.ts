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
