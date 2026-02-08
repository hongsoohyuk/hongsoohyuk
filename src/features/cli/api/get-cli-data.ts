import {cache} from 'react';

import {getBlogList} from '@/features/blog';
import {getProjectList} from '@/features/project';
import {getResumePage} from '@/features/resume';
import type {NotionBlockWithChildren} from '@/types/notion';

import type {CliData} from '../types';

function blocksToPlainText(blocks: NotionBlockWithChildren[], indent = 0): string {
  const lines: string[] = [];
  const prefix = '  '.repeat(indent);

  for (const block of blocks) {
    const richText = extractRichText(block);

    switch (block.type) {
      case 'heading_1':
        lines.push('', `${prefix}# ${richText}`, '');
        break;
      case 'heading_2':
        lines.push('', `${prefix}## ${richText}`, '');
        break;
      case 'heading_3':
        lines.push(`${prefix}### ${richText}`);
        break;
      case 'paragraph':
        lines.push(richText ? `${prefix}${richText}` : '');
        break;
      case 'bulleted_list_item':
        lines.push(`${prefix}- ${richText}`);
        break;
      case 'numbered_list_item':
        lines.push(`${prefix}* ${richText}`);
        break;
      case 'to_do': {
        const checked = block.to_do?.checked ? '[x]' : '[ ]';
        lines.push(`${prefix}${checked} ${richText}`);
        break;
      }
      case 'quote':
        lines.push(`${prefix}> ${richText}`);
        break;
      case 'callout': {
        const icon = block.callout?.icon?.type === 'emoji' ? block.callout.icon.emoji + ' ' : '';
        lines.push(`${prefix}${icon}${richText}`);
        break;
      }
      case 'divider':
        lines.push(`${prefix}---`);
        break;
      case 'code': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (block.code?.rich_text ?? []).map((t: any) => t?.plain_text ?? '').join('');
        lines.push(`${prefix}\`\`\``, `${prefix}${code}`, `${prefix}\`\`\``);
        break;
      }
      case 'toggle':
        lines.push(`${prefix}▸ ${richText}`);
        break;
      default:
        if (richText) lines.push(`${prefix}${richText}`);
        break;
    }

    if (block.children && block.children.length > 0) {
      lines.push(blocksToPlainText(block.children, indent + 1));
    }
  }

  return lines.join('\n');
}

function extractRichText(block: NotionBlockWithChildren): string {
  const typeKey = block.type as string;
  const data = block[typeKey];
  if (!data?.rich_text) return '';
  return (data.rich_text as Array<{plain_text: string}>).map((t) => t.plain_text).join('');
}

export const getCliData = cache(async function getCliData(): Promise<CliData> {
  const [blogData, projectData, resumeData] = await Promise.all([
    getBlogList().catch(() => ({items: []})),
    getProjectList().catch(() => ({items: [], pagination: {page: 1, pageSize: 10, totalItems: 0, totalPages: 0}})),
    getResumePage().catch(() => ({blocks: []})),
  ]);

  const blogPosts = blogData.items.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    categories: post.categories,
  }));

  const projects = projectData.items.map((project) => ({
    slug: project.slug,
    title: project.title,
  }));

  const resumeText = resumeData.blocks.length > 0
    ? blocksToPlainText(resumeData.blocks)
    : '이력서 데이터를 불러올 수 없습니다.\n\n> 웹에서 확인하세요: /resume';

  return {blogPosts, projects, resumeText};
});
