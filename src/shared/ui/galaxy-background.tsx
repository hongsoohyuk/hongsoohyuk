import {cn} from '@/shared/lib/utils';

type Props = {
  className?: string;
};

export function GalaxyBackground({className}: Props) {
  return (
    <div className={cn('bg-galaxy pointer-events-none', className)} aria-hidden>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_at_20%_20%,rgba(59,130,246,0.15),transparent),radial-gradient(850px_at_80%_10%,rgba(236,72,153,0.12),transparent),radial-gradient(850px_at_55%_70%,rgba(14,165,233,0.14),transparent)] mix-blend-screen opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.03),rgba(255,255,255,0)),linear-gradient(250deg,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
    </div>
  );
}

