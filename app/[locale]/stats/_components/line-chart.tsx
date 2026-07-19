import {SERIES_STROKE_CLASSES, SERIES_SWATCH_CLASSES} from '../_lib/chart-palette';

type Point = {day: string; value: number};
type Series = {label: string; points: Point[]};
type Props = {series: Series[]; label: string; emptyLabel: string};

const W = 600;
const H = 200;
const PAD_X = 6;
const PAD_TOP = 8;
const PAD_BOTTOM = 6;

export function LineChart({series, label, emptyLabel}: Props) {
  const max = Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 0);
  if (series.length === 0 || max === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  const n = series[0].points.length;
  const x = (i: number) => (n === 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (n - 1));
  const y = (v: number) => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOTTOM);
  const firstDay = series[0].points[0]?.day;
  const lastDay = series[0].points[n - 1]?.day;

  return (
    <figure>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{max.toLocaleString()}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-40 w-full sm:h-48"
        role="img"
        aria-label={label}
      >
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={y(max * f)}
            y2={y(max * f)}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            className="stroke-border"
          />
        ))}
        {series.map((s, si) => (
          <g key={s.label}>
            <polyline
              fill="none"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={s.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
              className={SERIES_STROKE_CLASSES[si]}
            />
            {s.points.map(
              (p, i) =>
                p.value > 0 && (
                  <circle key={p.day} cx={x(i)} cy={y(p.value)} r={8} fill="transparent">
                    <title>{`${p.day} · ${s.label}: ${p.value.toLocaleString()}`}</title>
                  </circle>
                ),
            )}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{firstDay}</span>
        <span>{lastDay}</span>
      </div>
      <figcaption className="mt-2">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {series.map((s, si) => (
            <li key={s.label} className="flex items-center gap-1.5">
              <span aria-hidden className={`size-2.5 rounded-sm ${SERIES_SWATCH_CLASSES[si]}`} />
              {s.label}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
