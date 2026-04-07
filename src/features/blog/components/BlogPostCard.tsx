'use client';

import {LocalDateTime} from '@/components/ui/local-date-time';
import {Link} from '@/lib/i18n/routing';

import type {BlogListItem} from '../types';
import {CategoryBadges} from './CategoryBadges';

type Props = {
  post: BlogListItem;
};

export function BlogPostCard({post}: Props) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block py-4 border-b border-border/50 transition-colors hover:border-foreground/20"
    >
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate">
          {post.title}
        </h3>
        <div className="flex gap-1 shrink-0">
          <CategoryBadges categories={post.categories} size="sm" />
        </div>
      </div>

      {post.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.description}</p>}
    </Link>
  );
}
