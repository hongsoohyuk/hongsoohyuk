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
  topTracks?: Array<{name: string; artist: string}>;
  topArtists?: Array<{name: string; genres: string[]}>;
  recentlyPlayed?: Array<{name: string; artist: string}>;
};

function formatProjects(projects: DynamicContext['projects']): string {
  if (!projects?.length) return '';

  const list = projects.map((p) => `- ${p.title}${p.description ? `: ${p.description}` : ''}`).join('\n');

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

function formatMusic(context: DynamicContext): string {
  const parts: string[] = [];

  if (context.topTracks?.length) {
    const list = context.topTracks.map((t) => `- ${t.name} — ${t.artist}`).join('\n');
    parts.push(`### 최근 자주 듣는 곡\n${list}`);
  }

  if (context.topArtists?.length) {
    const list = context.topArtists
      .map((a) => `- ${a.name}${a.genres.length ? ` (${a.genres.join(', ')})` : ''}`)
      .join('\n');
    parts.push(`### 좋아하는 아티스트\n${list}`);
  }

  if (context.recentlyPlayed?.length) {
    const list = context.recentlyPlayed.map((t) => `- ${t.name} — ${t.artist}`).join('\n');
    parts.push(`### 방금 들은 곡\n${list}`);
  }

  if (parts.length === 0) return '';
  return `\n## 음악 취향 (Spotify 실시간 데이터)\n\n${parts.join('\n\n')}`;
}

export async function buildSystemPrompt(context?: DynamicContext): Promise<string> {
  const staticPrompt = await loadStaticPrompt();

  const dynamicParts = [
    formatProjects(context?.projects),
    formatBlogPosts(context?.blogPosts),
    context ? formatMusic(context) : '',
  ].filter(Boolean);

  if (dynamicParts.length === 0) return staticPrompt;

  return staticPrompt + '\n' + dynamicParts.join('\n');
}
