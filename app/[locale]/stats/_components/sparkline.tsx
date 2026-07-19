import {SPARK_STROKE_CLASS} from '../_lib/chart-palette';

type Props = {points: Array<number | null>};

export function Sparkline({points}: Props) {
  const values = points.filter((v): v is number => v !== null);
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const n = points.length;
  const coords = points
    .map((v, i) => (v === null ? null : `${n === 1 ? 50 : (i / (n - 1)) * 100},${26 - ((v - min) / range) * 24}`))
    .filter((c): c is string => c !== null)
    .join(' ');

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" className="mt-3 h-7 w-full">
      <polyline
        points={coords}
        fill="none"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={SPARK_STROKE_CLASS}
      />
    </svg>
  );
}
