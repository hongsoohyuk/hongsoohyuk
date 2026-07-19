import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/lib/i18n/routing';
import {DailyChart} from './_components/daily-chart';
import {LineChart} from './_components/line-chart';
import {PageDayHeatmap} from './_components/page-day-heatmap';
import {RankList} from './_components/rank-list';
import {StatCard} from './_components/stat-card';
import {VitalsPanel} from './_components/vitals-panel';
import {fillDailySeries, pivotDaily, vitalSparkSeries} from './_lib/format';
import {getStats, parsePeriod, type BeaconStats, type StatsPeriod} from './_lib/queries';
import type {Metadata} from 'next';

const EMPTY_STATS: BeaconStats = {
  summary: {pageviews: 0, visitors: 0, sessions: 0, clicks: 0},
  daily: [],
  sources: [],
  pages: [],
  vitals: [],
  pageDaily: [],
  sourceDaily: [],
  landing: [],
  exit: [],
  blogPosts: [],
  vitalsDaily: [],
  worstLcp: [],
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

  // 테이블/RPC 미생성 등 수집 인프라 장애가 페이지 자체를 죽이면 안 됨 — 빈 지표로 렌더
  let stats: BeaconStats;
  try {
    stats = await getStats(period);
  } catch (error) {
    console.error('[stats] fetch failed:', error);
    stats = EMPTY_STATS;
  }

  const daily = fillDailySeries(stats.daily, period);
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
    [...new Set(stats.vitalsDaily.map((r) => r.metric))].map((m) => [
      m,
      vitalSparkSeries(stats.vitalsDaily, m, period),
    ]),
  );
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
              aria-current={period === d ? 'page' : undefined}
              className={`rounded-md px-3 py-1 ${period === d ? 'bg-muted font-medium' : 'text-muted-foreground'}`}
            >
              {t(d === 7 ? 'period7' : 'period30')}
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

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('pageDaily')}</h2>
        <PageDayHeatmap matrix={pageMatrix} emptyLabel={t('empty')} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('sourceTrend')}</h2>
        <LineChart series={sourceSeries} label={t('sourceTrend')} emptyLabel={t('empty')} />
      </section>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('sources')}</h2>
          <RankList items={stats.sources.map((s) => ({label: s.source, value: s.sessions}))} emptyLabel={t('empty')} />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t('topPages')}</h2>
          <RankList items={stats.pages.map((p) => ({label: p.path, value: p.pv}))} emptyLabel={t('empty')} />
        </section>
      </div>

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

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t('vitals')}</h2>
        <VitalsPanel vitals={stats.vitals} sparks={sparks} emptyLabel={t('empty')} />
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold">{t('worstLcp')}</h2>
        <p className="mb-3 text-xs text-muted-foreground">{t('worstLcpNote')}</p>
        <RankList
          items={stats.worstLcp.map((p) => ({label: p.path, value: Math.round(p.p75)}))}
          emptyLabel={t('empty')}
        />
      </section>

      <footer className="mt-10 space-y-1 border-t pt-4 text-xs text-muted-foreground">
        <p>{t('p75Note')}</p>
        <p>{t('privacyNote')}</p>
      </footer>
    </main>
  );
}
