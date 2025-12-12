'use client';

import {cn} from '@/shared/lib/utils';
import Silk from '@/shared/ui/Silk';
import {useEffect, useState} from 'react';

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
  color,
  speed,
  scale = 1,
  noiseIntensity,
  rotation = 0.08,
}: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const read = () => root.classList.contains('dark');
    setIsDark(read());

    const observer = new MutationObserver(() => setIsDark(read()));
    observer.observe(root, {attributes: true, attributeFilter: ['class']});
    return () => observer.disconnect();
  }, []);

  // Light theme only: brighten the background. Dark theme keeps the previous look.
  const resolvedColor = color ?? (isDark ? '#505050' : '#e9e9f2');
  const resolvedSpeed = speed ?? (isDark ? 3 : 1.8);
  const resolvedNoise = noiseIntensity ?? (isDark ? 10 : 6);

  return (
    <div className={cn('pointer-events-none fixed inset-0 -z-20', className)}>
      <Silk
        color={resolvedColor}
        speed={resolvedSpeed}
        scale={scale}
        noiseIntensity={resolvedNoise}
        rotation={rotation}
      />
    </div>
  );
}
