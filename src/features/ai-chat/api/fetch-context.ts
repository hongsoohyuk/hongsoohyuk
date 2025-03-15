import {getBlogList} from '@/features/blog/api/get-blog-list';
import {getProjectList} from '@/features/project/api/pages/get-project-list';

import type {DynamicContext} from './build-prompt';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

let cached: {data: DynamicContext; expiry: number} | null = null;

export async function fetchDynamicContext(): Promise<DynamicContext> {
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  const [projectRes, blogRes] = await Promise.allSettled([
    getProjectList(),
    getBlogList(),
  ]);

  const context: DynamicContext = {};

  if (projectRes.status === 'fulfilled') {
    context.projects = projectRes.value.items.map((p) => ({
      title: p.title,
      description: p.description,
    }));
  }

  if (blogRes.status === 'fulfilled') {
    context.blogPosts = blogRes.value.items.slice(0, 10).map((b) => ({
      title: b.title,
      description: b.description,
      categories: b.categories,
    }));
  }

  cached = {data: context, expiry: Date.now() + CACHE_TTL_MS};
  return context;
}
