import {Empty, EmptyDescription} from '@/components/ui/empty';
import type {DailyPageviews} from '../_lib/queries';

type Props = {data: DailyPageviews[]; emptyLabel: string};

export function DailyChart({data, emptyLabel}: Props) {
  const max = Math.max(...data.map((d) => d.pv), 0);
  if (max === 0)
    return (
      <Empty variant="inline">
        <EmptyDescription>{emptyLabel}</EmptyDescription>
      </Empty>
    );

  return (
    <div>
      <div className="flex h-40 items-end gap-px sm:gap-1">
        {data.map((d) => (
          <div
            key={d.day}
            title={`${d.day} · ${d.pv.toLocaleString()}`}
            className="min-w-0 flex-1 rounded-t bg-primary/70 hover:bg-primary"
            style={{height: `${Math.max((d.pv / max) * 100, d.pv > 0 ? 3 : 1)}%`}}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}
