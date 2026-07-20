import * as React from 'react';

import {cn} from '@/utils/style';
import {Skeleton} from './skeleton';

const SKELETON_TEXT_WIDTHS = ['w-full', 'w-5/6', 'w-2/3'] as const;

function SkeletonText({lines = 3, className, ...props}: React.ComponentProps<'div'> & {lines?: number}) {
  return (
    <div data-slot="skeleton-text" className={cn('space-y-3', className)} {...props}>
      {Array.from({length: lines}, (_, index) => (
        <Skeleton key={index} className={cn('h-4', SKELETON_TEXT_WIDTHS[index % SKELETON_TEXT_WIDTHS.length])} />
      ))}
    </div>
  );
}

export {SkeletonText};
