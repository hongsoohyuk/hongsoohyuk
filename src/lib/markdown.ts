import {readFile, readdir} from 'fs/promises';
import {join} from 'path';

import matter from 'gray-matter';

const CONTENT_DIR = join(process.cwd(), 'content');

export type MarkdownFile<T extends Record<string, unknown> = Record<string, unknown>> = {
  slug: string;
  frontmatter: T;
  content: string;
};

export async function getMarkdownFiles<T extends Record<string, unknown>>(
  subdir: string,
): Promise<MarkdownFile<T>[]> {
  const dir = join(CONTENT_DIR, subdir);
  const files = await readdir(dir);

  const results = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (filename) => {
        const raw = await readFile(join(dir, filename), 'utf-8');
        const {data, content} = matter(raw);
        return {
          slug: filename.replace(/\.md$/, ''),
          frontmatter: data as T,
          content,
        };
      }),
  );

  return results;
}

export async function getMarkdownFile<T extends Record<string, unknown>>(
  subdir: string,
  slug: string,
): Promise<MarkdownFile<T>> {
  const filePath = join(CONTENT_DIR, subdir, `${slug}.md`);
  const raw = await readFile(filePath, 'utf-8');
  const {data, content} = matter(raw);

  return {
    slug,
    frontmatter: data as T,
    content,
  };
}
