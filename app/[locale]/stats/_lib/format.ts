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
    if (!byKey.has(r.key))
      byKey.set(
        r.key,
        keys.map(() => 0),
      );
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
