'use client';

import {useDarkMode} from '@/shared/lib/hooks/use-dark-mode';
import Silk from '@/shared/ui/Silk';

const DEFAULT_SCALE = 0.8;
const DEFAULT_NOISE_INTENSITY = 10;
const DEFAULT_SPEED = 3;
const DEFAULT_ROTATION = 0.08;

export function SilkBackground() {
  const isDark = useDarkMode();

  const resolvedColor = isDark ? '#505050' : '#e9e9e9';

  return (
    <div className="pointer-events-none fixed inset-0 -z-20">
      <Silk
        color={resolvedColor}
        speed={DEFAULT_SPEED}
        scale={DEFAULT_SCALE}
        noiseIntensity={DEFAULT_NOISE_INTENSITY}
        rotation={DEFAULT_ROTATION}
      />
    </div>
  );
}
