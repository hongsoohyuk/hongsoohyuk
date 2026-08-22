import type {BlogListItem} from '@/lib/content/blog';
import {filterBlogPosts} from '../filter-posts';


function makePost(slug: string, title: string, categories: BlogListItem['categories'] = []): BlogListItem {
  return {
    slug,
    title,
    description: '',
    categories,
    keywords: [],
    lastEditedTime: '2024-01-01T00:00:00Z',
  };
}

describe('filterBlogPosts', () => {
  it('returns every post when no filter is given', () => {
    const posts = [makePost('a', 'Post A'), makePost('b', 'Post B')];

    expect(filterBlogPosts(posts, {})).toHaveLength(2);
  });

  it('filters by search query (case-insensitive)', () => {
    const posts = [makePost('post-1', 'React Hooks Guide'), makePost('post-2', 'Vue Composition API')];

    const result = filterBlogPosts(posts, {q: 'react'});

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('React Hooks Guide');
  });

  it('filters by category', () => {
    const posts = [makePost('post-1', 'Post A', ['Frontend']), makePost('post-2', 'Post B', ['Backend'])];

    const result = filterBlogPosts(posts, {category: 'Frontend'});

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Post A');
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
    const posts = [makePost('post-1', 'React Post'), makePost('post-2', 'Vue Post')];

    filterBlogPosts(posts, {q: 'react'});

    expect(posts).toHaveLength(2);
  });
});
