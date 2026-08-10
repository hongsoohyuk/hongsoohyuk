import {
  ContentListRow,
  ContentListRowBadges,
  ContentListRowDescription,
  ContentListRowHeader,
  ContentListRowTitle,
} from '@/components/content/content-list-row';
import {ItemGroup} from '@/components/ui/item';

import type {BlogListItem} from '@/lib/content/blog';
import {Link} from '@/lib/i18n/routing';

import {CategoryBadges} from './category-badges';

type Props = {
  posts: BlogListItem[];
  emptyText: string;
};

export function BlogContent({posts, emptyText}: Props) {
  if (posts.length === 0) return <p className="text-center text-muted-foreground py-8">{emptyText}</p>;

  return (
    <ItemGroup>
      {posts.map((post) => (
        <ContentListRow key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            data-beacon-event="click"
            data-beacon-prop-target="blog-card"
            data-beacon-prop-slug={post.slug}
          >
            <ContentListRowHeader className="mb-1">
              <ContentListRowTitle>{post.title}</ContentListRowTitle>
              <ContentListRowBadges>
                <CategoryBadges categories={post.categories} size="sm" />
              </ContentListRowBadges>
            </ContentListRowHeader>

            {post.description && (
              <ContentListRowDescription className="mb-2">{post.description}</ContentListRowDescription>
            )}
          </Link>
        </ContentListRow>
      ))}
    </ItemGroup>
  );
}
