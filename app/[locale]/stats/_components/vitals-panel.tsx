import {formatVitalValue, ratingPercents, sortVitals} from '../_lib/format';
import type {VitalStat} from '../_lib/queries';

type Props = {vitals: VitalStat[]; emptyLabel: string};

export function VitalsPanel({vitals, emptyLabel}: Props) {
  if (vitals.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sortVitals(vitals).map((vital) => {
        const pct = ratingPercents(vital);
        return (
          <div key={vital.metric} className="rounded-lg border p-4">
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
          </div>
        );
      })}
    </div>
  );
}
