import {readFile} from 'fs/promises';
import {join} from 'path';

const PROMPTS_DIR = join(process.cwd(), 'src/features/ai-chat/prompts');

let cachedStaticPrompt: string | null = null;

async function loadStaticPrompt(): Promise<string> {
  if (cachedStaticPrompt) return cachedStaticPrompt;

  const [system, rules, examples] = await Promise.all([
    readFile(join(PROMPTS_DIR, 'system.md'), 'utf-8'),
    readFile(join(PROMPTS_DIR, 'rules.md'), 'utf-8'),
    readFile(join(PROMPTS_DIR, 'examples.md'), 'utf-8'),
  ]);

  cachedStaticPrompt = [system, rules, examples].join('\n\n');
  return cachedStaticPrompt;
}

export type DynamicContext = {
  projects?: Array<{title: string; description: string}>;
  blogPosts?: Array<{title: string; description: string; categories: string[]}>;
};

function formatProjects(projects: DynamicContext['projects']): string {
  if (!projects?.length) return '';

  const list = projects
    .map((p) => `- ${p.title}${p.description ? `: ${p.description}` : ''}`)
    .join('\n');

  return `\n## 현재 등록된 프로젝트\n\n${list}`;
}

function formatBlogPosts(posts: DynamicContext['blogPosts']): string {
  if (!posts?.length) return '';

  const list = posts
    .map((p) => {
      const cats = p.categories.length > 0 ? ` [${p.categories.join(', ')}]` : '';
      return `- ${p.title}${cats}${p.description ? ` — ${p.description}` : ''}`;
    })
    .join('\n');

  return `\n## 최근 블로그 글\n\n${list}`;
}

export async function buildSystemPrompt(context?: DynamicContext): Promise<string> {
  const staticPrompt = await loadStaticPrompt();

  const dynamicParts = [
    formatProjects(context?.projects),
    formatBlogPosts(context?.blogPosts),
  ].filter(Boolean);

  if (dynamicParts.length === 0) return staticPrompt;

  return staticPrompt + '\n' + dynamicParts.join('\n');
}
