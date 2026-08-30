import type {BlogListItem, BlogVisibility} from '@/lib/content/blog';

export type BlogFilter = {
  q?: string;
  category?: string;
  visibility?: BlogVisibility;
};

// 글 목록이 전부 정적 마크다운이라 필터링은 클라이언트에서 수행한다.
// 서버는 전체 목록만 정적으로 렌더하고, URL 쿼리에 따른 좁히기는 여기서 처리.
// 기본은 public만 노출하고, visibility=private일 때만 private 필기를 보여준다.
export function filterBlogPosts(posts: BlogListItem[], {q, category, visibility}: BlogFilter): BlogListItem[] {
  const targetVisibility: BlogVisibility = visibility === 'private' ? 'private' : 'public';
  let items = posts.filter((item) => item.visibility === targetVisibility);

  if (q) {
    const query = q.toLowerCase();
    items = items.filter((item) => item.title.toLowerCase().includes(query));
  }

  if (category) {
    items = items.filter((item) => item.categories.includes(category as BlogListItem['categories'][number]));
  }

  return items;
}
