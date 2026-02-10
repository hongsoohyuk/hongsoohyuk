
import {getBlogList} from '@/features/blog/api';
import {getProjectList} from '@/features/project/api';
import {SITE_CONFIG} from '@/config';
import type {MetadataRoute} from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_CONFIG.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en`}},
    },
    {
      url: `${SITE_CONFIG.url}/resume`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en/resume`}},
    },
    {
      url: `${SITE_CONFIG.url}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en/blog`}},
    },
    {
      url: `${SITE_CONFIG.url}/project`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en/project`}},
    },
    {
      url: `${SITE_CONFIG.url}/instagram`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en/instagram`}},
    },
    {
      url: `${SITE_CONFIG.url}/guestbook`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en/guestbook`}},
    },
  ];

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogData = await getBlogList();
    blogPages = blogData.items.map((post) => ({
      url: `${SITE_CONFIG.url}/blog/${post.slug}`,
      lastModified: new Date(post.lastEditedTime),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en/blog/${post.slug}`}},
    }));
  } catch {
    // Continue without blog pages if Notion API fails
  }

  // Dynamic project pages
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const projectData = await getProjectList();
    projectPages = projectData.items.map((project) => ({
      url: `${SITE_CONFIG.url}/project/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {languages: {en: `${SITE_CONFIG.url}/en/project/${project.slug}`}},
    }));
  } catch {
    // Continue without project pages if Notion API fails
  }

  return [...staticPages, ...blogPages, ...projectPages];
}
