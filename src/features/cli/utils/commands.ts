import {normalizePath, resolvePath, segmentsToPath} from './filesystem';

import type {DirectoryNode} from '../types';

type CommandContext = {
  fs: DirectoryNode;
  cwd: string;
};

type CommandResult = {
  output: string;
  isError?: boolean;
  newCwd?: string;
  clear?: boolean;
};

type CommandHandler = (args: string[], ctx: CommandContext) => CommandResult;

const COMMANDS: Record<string, CommandHandler> = {
  help: () => ({
    output: [
      'Available commands:',
      '',
      '  ls [path]       디렉토리 내용 보기',
      '  cat <file>      파일 내용 보기',
      '  cd <dir>        디렉토리 이동',
      '  pwd             현재 경로 출력',
      '  echo <text>     텍스트 출력',
      '  whoami          사이트 소개',
      '  clear           화면 지우기',
      '  help            명령어 목록',
    ].join('\n'),
  }),

  ls: (args, ctx) => {
    const target = args[0] || '.';
    const node = resolvePath(ctx.fs, ctx.cwd, target);

    if (!node) {
      return {output: `ls: '${target}': No such file or directory`, isError: true};
    }

    if (node.type === 'file') {
      return {output: node.name};
    }

    const entries = Object.values(node.children)
      .map((child) => {
        if (child.type === 'directory') return `${child.name}/`;
        return child.name;
      })
      .sort((a, b) => {
        const aIsDir = a.endsWith('/');
        const bIsDir = b.endsWith('/');
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });

    if (entries.length === 0) {
      return {output: '(empty directory)'};
    }

    return {output: entries.join('\n')};
  },

  cat: (args, ctx) => {
    if (args.length === 0) {
      return {output: 'cat: missing file operand', isError: true};
    }

    const target = args[0];
    const node = resolvePath(ctx.fs, ctx.cwd, target);

    if (!node) {
      return {output: `cat: '${target}': No such file or directory`, isError: true};
    }

    if (node.type === 'directory') {
      return {output: `cat: '${target}': Is a directory`, isError: true};
    }

    return {output: node.content};
  },

  cd: (args, ctx) => {
    const target = args[0] || '~';

    if (target === '~' || target === '/') {
      return {output: '', newCwd: '~'};
    }

    const segments = normalizePath(ctx.cwd, target);
    const node = resolvePath(ctx.fs, '~', segmentsToPath(segments));

    if (!node) {
      return {output: `cd: '${target}': No such file or directory`, isError: true};
    }

    if (node.type !== 'directory') {
      return {output: `cd: '${target}': Not a directory`, isError: true};
    }

    return {output: '', newCwd: segmentsToPath(segments)};
  },

  pwd: (_args, ctx) => ({
    output: ctx.cwd,
  }),

  echo: (args) => ({
    output: args.join(' '),
  }),

  whoami: () => ({
    output: [
      'hongsoohyuk.com - 프론트엔드 개발자 홍수혁의 포트폴리오',
      '',
      'Built with Next.js, React, TypeScript',
      'Try: ls, cat about.txt, cat resume/resume.txt',
    ].join('\n'),
  }),

  clear: () => ({
    output: '',
    clear: true,
  }),
};

export function executeCommand(input: string, ctx: CommandContext): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return {output: ''};

  const parts = parseCommandLine(trimmed);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = COMMANDS[cmd];
  if (!handler) {
    return {
      output: `${cmd}: command not found. Type 'help' for available commands.`,
      isError: true,
    };
  }

  return handler(args, ctx);
}

function parseCommandLine(input: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (const ch of input) {
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === ' ') {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }

  if (current) parts.push(current);
  return parts;
}
