type Item = {label: string; value: number};
type Props = {items: Item[]; emptyLabel: string};

export function RankList({items, emptyLabel}: Props) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  const max = Math.max(...items.map((i) => i.value));

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="relative overflow-hidden rounded">
          <div className="absolute inset-y-0 left-0 bg-muted" style={{width: `${(item.value / max) * 100}%`}} />
          <div className="relative flex items-center justify-between gap-2 px-2 py-1 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="tabular-nums text-muted-foreground">{item.value.toLocaleString()}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
