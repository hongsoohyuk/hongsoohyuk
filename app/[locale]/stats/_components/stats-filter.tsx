import {getTranslations} from 'next-intl/server';
import {Link} from '@/lib/i18n/routing';
import {STATS_SITE_ID, STATS_SITES, type StatsPeriod, type StatsSite} from '../_lib/queries';

type Props = {site: StatsSite; period: StatsPeriod};

const PERIODS: StatsPeriod[] = [7, 30];

// 기본값(hongsoohyuk.com · 7일)은 쿼리에서 생략해 기존 /stats URL을 유지한다
function statsHref(site: StatsSite, period: StatsPeriod) {
  const query: Record<string, string> = {};
  if (site !== STATS_SITE_ID) query.site = site;
  if (period !== 7) query.days = String(period);
  return {pathname: '/stats' as const, query};
}

function tabClass(active: boolean) {
  return `rounded-md px-3 py-1 ${active ? 'bg-muted font-medium' : 'text-muted-foreground'}`;
}

export async function StatsFilter({site, period}: Props) {
  const t = await getTranslations('Stats');
  const siteLabel = (s: StatsSite) => (s === STATS_SITE_ID ? t('siteHongsoohyuk') : t('siteMegaBobs'));

  return (
    <div className="flex flex-wrap gap-2">
      <nav aria-label={t('site')} className="flex gap-1 rounded-lg border p-0.5 text-sm">
        {STATS_SITES.map((s) => (
          <Link
            key={s}
            href={statsHref(s, period)}
            aria-current={site === s ? 'page' : undefined}
            className={tabClass(site === s)}
          >
            {siteLabel(s)}
          </Link>
        ))}
      </nav>
      <nav aria-label={t('period')} className="flex gap-1 rounded-lg border p-0.5 text-sm">
        {PERIODS.map((d) => (
          <Link
            key={d}
            href={statsHref(site, d)}
            aria-current={period === d ? 'page' : undefined}
            className={tabClass(period === d)}
          >
            {t(d === 7 ? 'period7' : 'period30')}
          </Link>
        ))}
      </nav>
    </div>
  );
}
