'use client';

import {PropsWithChildren} from 'react';

import {cn} from '@/shared/lib/style';

type GlassCardProps = PropsWithChildren<{
  className?: string;
  contentClassName?: string;
  paddingClassName?: string;
}>;

export function GlassCard({children, className, contentClassName, paddingClassName}: GlassCardProps) {
  return (
    <div className={cn('glass-card w-full', className)}>
      <div className={cn('flex flex-col gap-4', paddingClassName ?? 'p-6', contentClassName)}>{children}</div>
    </div>
  );
}
