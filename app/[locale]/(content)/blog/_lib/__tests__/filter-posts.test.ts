import type {BlogListItem} from '@/lib/content/blog';
import {filterBlogPosts} from '../filter-posts';

function makePost(
  slug: string,
  title: string,
  categories: BlogListItem['categories'] = [],
  visibility: BlogListItem['visibility'] = 'public',
): BlogListItem {
  return {
    slug,
    title,
    description: '',
    categories,
    keywords: [],
    lastEditedTime: '2024-01-01T00:00:00Z',
    visibility,
  };
}

describe('filterBlogPosts', () => {
  it('hides private posts by default', () => {
    const posts = [makePost('a', 'Public', [], 'public'), makePost('b', 'Private', [], 'private')];

    const result = filterBlogPosts(posts, {});

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('a');
  });

  it('shows only private posts when visibility=private', () => {
    const posts = [makePost('a', 'Public', [], 'public'), makePost('b', 'Private', [], 'private')];

    const result = filterBlogPosts(posts, {visibility: 'private'});

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('b');
  });

  it('filters by search query (case-insensitive)', () => {
    const posts = [makePost('post-1', 'React Hooks Guide'), makePost('post-2', 'Vue Composition API')];

    const result = filterBlogPosts(posts, {q: 'react'});

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('React Hooks Guide');
  });

  it('filters by category among public posts', () => {
    const posts = [
      makePost('post-1', 'Post A', ['Frontend']),
      makePost('post-2', 'Post B', ['Backend']),
      makePost('memo', 'Private Frontend', ['Frontend'], 'private'),
    ];

    const result = filterBlogPosts(posts, {category: 'Frontend'});

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Post A');
  });

  it('combines private visibility with category', () => {
    const posts = [
      makePost('pub', 'Public Frontend', ['Frontend'], 'public'),
      makePost('priv-fe', 'Private Frontend', ['Frontend'], 'private'),
      makePost('priv-be', 'Private Backend', ['Backend'], 'private'),
    ];

    const result = filterBlogPosts(posts, {visibility: 'private', category: 'Frontend'});

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('priv-fe');
  });

  it('combines search and category filters', () => {
    const posts = [
      makePost('post-1', 'React Post', ['Frontend']),
      makePost('post-2', 'React Backend', ['Backend']),
      makePost('post-3', 'Vue Post', ['Frontend']),
    ];

    const result = filterBlogPosts(posts, {q: 'react', category: 'Frontend'});

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('React Post');
  });

  it('returns an empty list when nothing matches', () => {
    const posts = [makePost('post-1', 'React Post', ['Frontend'])];

    expect(filterBlogPosts(posts, {q: 'svelte'})).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const posts = [makePost('post-1', 'React Post'), makePost('post-2', 'Vue Post', [], 'private')];

    filterBlogPosts(posts, {q: 'react'});

    expect(posts).toHaveLength(2);
  });
});
