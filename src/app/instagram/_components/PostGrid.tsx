import {IG_FEED_STYLES} from '@/lib/constants/instagram';
import {ReactNode} from 'react';

interface PostGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const GRID_COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
} as const;

export function PostGrid({children, columns = 3}: PostGridProps) {
  return (
    <div className={IG_FEED_STYLES.gridColsClass} role="feed">
      {children}
    </div>
  );
}
