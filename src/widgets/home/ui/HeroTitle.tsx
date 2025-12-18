'use client';

import {ScrollVelocity} from '@/shared/ui';

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
