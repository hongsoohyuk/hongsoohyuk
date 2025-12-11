'use client';

import {cn} from '@/shared/lib/utils';
import GlassSurface, {GlassSurfaceProps} from '@/shared/ui/GlassSurface';
import {PropsWithChildren} from 'react';

type GlassCardProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  paddingClassName?: string;
  surfaceProps?: Partial<GlassSurfaceProps>;
}>;

export function GlassCard({
  children,
  className,
  contentClassName,
  paddingClassName = 'p-5',
  surfaceProps,
}: GlassCardProps) {
  return (
    <GlassSurface
      width="100%"
      height="100%"
      borderRadius={22}
      backgroundOpacity={surfaceProps?.backgroundOpacity ?? 0.1}
      blur={surfaceProps?.blur ?? 14}
      saturation={surfaceProps?.saturation ?? 1.25}
      className={cn('w-full', className)}
      {...surfaceProps}
    >
      <div className={cn('relative z-10 w-full', paddingClassName, contentClassName)}>{children}</div>
    </GlassSurface>
  );
}
