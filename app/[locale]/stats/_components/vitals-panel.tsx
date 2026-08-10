import {Empty, EmptyDescription} from '@/components/ui/empty';
import {StatTile} from '@/components/ui/stat-tile';
import {Sparkline} from './sparkline';
import {formatVitalValue, ratingPercents, sortVitals} from '../_lib/format';
import type {VitalStat} from '../_lib/queries';

type Props = {vitals: VitalStat[]; sparks: Record<string, Array<number | null>>; emptyLabel: string};

export function VitalsPanel({vitals, sparks, emptyLabel}: Props) {
  if (vitals.length === 0)
    return (
      <Empty variant="inline">
        <EmptyDescription>{emptyLabel}</EmptyDescription>
      </Empty>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sortVitals(vitals).map((vital) => {
        const pct = ratingPercents(vital);
        return (
          <StatTile key={vital.metric}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{vital.metric}</span>
              <span className="text-xl font-semibold tabular-nums">{formatVitalValue(vital.metric, vital.p75)}</span>
            </div>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
              <div className="bg-emerald-500" style={{width: `${pct.good}%`}} />
              <div className="bg-amber-500" style={{width: `${pct.needsImprovement}%`}} />
              <div className="bg-red-500" style={{width: `${pct.poor}%`}} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              good {pct.good}% · ni {pct.needsImprovement}% · poor {pct.poor}%
            </p>
            <Sparkline points={sparks[vital.metric] ?? []} />
          </StatTile>
        );
      })}
    </div>
  );
}
