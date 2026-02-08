import {Badge} from '@/components/ui/badge';
import {Link} from '@/lib/i18n/routing';

import type {BlogListItem} from '../types';

type Props = {
  post: BlogListItem;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

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
        {post.categories.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {post.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-[11px] px-1.5 py-0">
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {post.excerpt && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>
      )}

      <time dateTime={post.lastEditedTime} className="text-xs text-muted-foreground/70 tabular-nums">
        {formatDate(post.lastEditedTime)}
      </time>
    </Link>
  );
}
