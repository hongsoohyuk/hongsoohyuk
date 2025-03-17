import {Badge} from '@/components/ui/badge';

import type {BlogCategory} from '../types';

type Props = {
  categories: BlogCategory[];
  size?: 'sm' | 'default';
};

export function CategoryBadges({categories, size = 'default'}: Props) {
  if (categories.length === 0) return null;

  return categories.map((category) => (
    <Badge
      key={category}
      variant="secondary"
      className={size === 'sm' ? 'text-[11px] px-1.5 py-0' : undefined}
    >
      {category}
    </Badge>
  ));
}
