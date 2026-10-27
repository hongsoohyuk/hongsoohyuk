import {StatTile, StatTileLabel, StatTileValue} from '@/components/ui/stat-tile';
import {DailyChart} from './daily-chart';
import {hitRate} from '../_lib/format';
import type {SlackDailyRow} from '../_lib/queries';

type Props = {
  rows: SlackDailyRow[];
  labels: {calls: string; hits: string; hitRate: string; empty: string};
};

export function SlackPanel({rows, labels}: Props) {
  const calls = rows.reduce((sum, r) => sum + r.calls, 0);
  const hits = rows.reduce((sum, r) => sum + r.hits, 0);
  const rate = hitRate(rows);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatTile>
          <StatTileLabel>{labels.calls}</StatTileLabel>
          <StatTileValue>{calls.toLocaleString()}</StatTileValue>
        </StatTile>
        <StatTile>
          <StatTileLabel>{labels.hits}</StatTileLabel>
          <StatTileValue>{hits.toLocaleString()}</StatTileValue>
        </StatTile>
        <StatTile>
          <StatTileLabel>{labels.hitRate}</StatTileLabel>
          <StatTileValue>{rate === null ? '–' : `${rate}%`}</StatTileValue>
        </StatTile>
      </div>
      <DailyChart data={rows.map((r) => ({day: r.day, pv: r.calls}))} emptyLabel={labels.empty} />
    </div>
  );
}
