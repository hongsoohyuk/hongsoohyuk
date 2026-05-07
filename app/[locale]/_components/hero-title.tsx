'use client';

import {ScrollVelocity} from '@/components/ui/ScrollVelocity';

export function HeroTitle() {
  return (
    <ScrollVelocity
      velocity={100}
      numCopies={8}
      className="font-sans text-4xl font-bold tracking-tight text-foreground drop-shadow md:text-[5rem] md:leading-[5rem]"
    />
  );
}
