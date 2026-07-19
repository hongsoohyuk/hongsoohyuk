import {HEAT_CELL_CLASS} from '../_lib/chart-palette';
import type {DailyMatrix} from '../_lib/format';

type Props = {matrix: DailyMatrix; emptyLabel: string};

export function PageDayHeatmap({matrix, emptyLabel}: Props) {
  if (matrix.rows.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  const max = Math.max(...matrix.rows.flatMap((r) => r.cells), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr>
            <td />
            {matrix.days.map((d) => (
              <th
                key={d}
                scope="col"
                title={d}
                className="min-w-3.5 pb-1 text-center font-normal text-muted-foreground"
              >
                {Number(d.slice(8, 10))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="max-w-44 truncate pr-2 text-left font-normal text-foreground" title={row.key}>
                {row.key}
              </th>
              {row.cells.map((v, i) => (
                <td key={matrix.days[i]} title={`${row.key} · ${matrix.days[i]} · ${v}`} className="h-5">
                  {v > 0 ? (
                    <div
                      className={`size-full min-h-5 rounded-[2px] ${HEAT_CELL_CLASS}`}
                      style={{opacity: 0.2 + 0.8 * (v / max)}}
                    />
                  ) : (
                    <div className="size-full min-h-5 rounded-[2px] bg-muted/60" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
