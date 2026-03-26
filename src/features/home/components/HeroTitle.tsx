'use client';

import {Marquee} from '@/components/ui/Marquee';

export function HeroTitle() {
  return (
    <Marquee
      text="hongsoohyuk"
      speed={210}
      copies={16}
      className="font-sans text-4xl font-bold tracking-tight text-foreground drop-shadow md:text-[5rem] md:leading-[5rem]"
    />
  );
}
