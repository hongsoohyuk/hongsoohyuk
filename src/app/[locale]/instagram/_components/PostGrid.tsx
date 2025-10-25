import {ReactNode} from 'react';
import clsx from 'clsx';

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
  const columnClass = GRID_COLUMNS[columns] ?? GRID_COLUMNS[3];

  return (
    <div className={clsx('grid gap-0.5', columnClass)} role="feed">
      {children}
    </div>
  );
}
