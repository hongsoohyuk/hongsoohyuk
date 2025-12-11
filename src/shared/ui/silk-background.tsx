'use client';

import {cn} from '@/shared/lib/utils';
import Silk from '@/shared/ui/Silk';

type Props = {
  className?: string;
  color?: string;
  speed?: number;
  scale?: number;
  noiseIntensity?: number;
  rotation?: number;
};

export function SilkBackground({
  className,
  color = '#505050',
  speed = 3,
  scale = 1,
  noiseIntensity = 10,
  rotation = 0.08,
}: Props) {
  return (
    <div className={cn('pointer-events-none fixed inset-0 -z-20', className)}>
      <Silk color={color} speed={speed} scale={scale} noiseIntensity={noiseIntensity} rotation={rotation} />
    </div>
  );
}
