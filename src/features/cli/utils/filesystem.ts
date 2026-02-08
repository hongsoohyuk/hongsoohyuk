import type {CliData, DirectoryNode, FileNode, FileSystemNode} from '../types';

function toFileName(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 60) + '.txt'
  );
}

export function buildFileSystem(data: CliData): DirectoryNode {
  const blogChildren: Record<string, FileNode> = {};
  for (const post of data.blogPosts) {
    const fileName = toFileName(post.title);
    const categories = post.categories.length > 0 ? `[${post.categories.join(', ')}]` : '';
    blogChildren[fileName] = {
      type: 'file',
      name: fileName,
      content: [
        `title: ${post.title}`,
        categories ? `categories: ${categories}` : '',
        '---',
        '',
        post.excerpt || '(내용 없음)',
        '',
        `> 전체 내용은 웹에서 확인하세요: /blog/${post.slug}`,
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }

  const projectChildren: Record<string, FileNode> = {};
  for (const project of data.projects) {
    const fileName = toFileName(project.title);
    projectChildren[fileName] = {
      type: 'file',
      name: fileName,
      content: [`title: ${project.title}`, '---', '', `> 전체 내용은 웹에서 확인하세요: /project/${project.slug}`].join(
        '\n',
      ),
    };
  }

  const root: DirectoryNode = {
    type: 'directory',
    name: '~',
    children: {
      'about.txt': {
        type: 'file',
        name: 'about.txt',
        content: [
          '================================',
          '  홍수혁 (Hong Soohyuk)',
          '  Frontend Developer',
          '================================',
          '',
          'React, Next.js, TypeScript를 주로 사용하는',
          '프론트엔드 개발자입니다.',
          '',
          'Contact:',
          '  email  : hongsoohyuk@icloud.com',
          '  github : github.com/hong-soohyuk',
          '  linkedin: linkedin.com/in/hong-soohyuk',
        ].join('\n'),
      },
      resume: {
        type: 'directory',
        name: 'resume',
        children: {
          'resume.txt': {
            type: 'file',
            name: 'resume.txt',
            content: data.resumeText,
          },
        },
      },
      blog: {
        type: 'directory',
        name: 'blog',
        children: blogChildren,
      },
      project: {
        type: 'directory',
        name: 'project',
        children: projectChildren,
      },
      guestbook: {
        type: 'directory',
        name: 'guestbook',
        children: {
          'info.txt': {
            type: 'file',
            name: 'info.txt',
            content: [
              '================================',
              '  방명록 (Guestbook)',
              '================================',
              '',
              '방문자들이 남겨준 소중한 메시지를 확인하세요.',
              '',
              '> 방명록 작성은 웹에서만 가능합니다: /guestbook',
            ].join('\n'),
          },
        },
      },
    },
  };

  return root;
}

export function resolvePath(root: DirectoryNode, cwd: string, target: string): FileSystemNode | null {
  const segments = normalizePath(cwd, target);

  let current: FileSystemNode = root;
  for (const seg of segments) {
    if (current.type !== 'directory') return null;
    const child: FileSystemNode | undefined = current.children[seg];
    if (!child) return null;
    current = child;
  }

  return current;
}

export function normalizePath(cwd: string, target: string): string[] {
  const isAbsolute = target.startsWith('~') || target.startsWith('/');
  const base = isAbsolute ? [] : cwdToSegments(cwd);
  const parts = target
    .replace(/^~\/?/, '')
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean);

  const result = [...base];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      result.pop();
    } else {
      result.push(part);
    }
  }

  return result;
}

function cwdToSegments(cwd: string): string[] {
  return cwd
    .replace(/^~\/?/, '')
    .split('/')
    .filter(Boolean);
}

export function segmentsToPath(segments: string[]): string {
  return segments.length === 0 ? '~' : `~/${segments.join('/')}`;
}
