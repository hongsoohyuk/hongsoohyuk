'use client';

import dynamic from 'next/dynamic';

const ScrollVelocity = dynamic(
  () => import('@/components/ui/ScrollVelocity').then((mod) => ({default: mod.ScrollVelocity})),
  {ssr: false},
);

export function HeroTitle() {
  return (
    <ScrollVelocity
      texts={['hongsoohyuk']}
      velocity={100}
      className="bg-clip-text text-foreground"
      numCopies={16}
      scrollerClassName="font-bold tracking-tight"
    />
  );
}
