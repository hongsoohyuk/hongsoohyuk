import {VirtualFS} from './filesystem';

import type {CommandResult, ExecContext} from '../types';

type CommandFn = (args: string[], ctx: ExecContext & {fs: VirtualFS; cwd: string}) => CommandResult;

function ok(stdout: string, extra?: Partial<CommandResult>): CommandResult {
  return {stdout, stderr: '', exitCode: 0, ...extra};
}

function fail(stderr: string): CommandResult {
  return {stdout: '', stderr, exitCode: 1};
}

// ─── Filesystem commands ───

const ls: CommandFn = (args, ctx) => {
  const {flags, operands} = parseFlags(args, ['l', 'a']);
  const target = operands[0] || '.';
  const node = ctx.fs.resolve(ctx.cwd, target);

  if (!node) return fail(`ls: '${target}': No such file or directory`);
  if (node.type === 'file') return ok(node.name);

  const entries = Object.values(node.children)
    .filter((c) => flags.has('a') || !c.name.startsWith('.'))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  if (entries.length === 0) return ok('');

  if (flags.has('l')) {
    const lines = entries.map((c) => {
      const perm = c.readonly ? 'r--' : 'rw-';
      const type = c.type === 'directory' ? 'd' : '-';
      const size = c.type === 'file' ? String(c.content.length).padStart(6) : '     -';
      const date = new Date(c.modifiedAt).toLocaleDateString('ko-KR');
      const suffix = c.type === 'directory' ? '/' : '';
      return `${type}${perm}  ${size}  ${date}  ${c.name}${suffix}`;
    });
    return ok(lines.join('\n'));
  }

  return ok(entries.map((c) => (c.type === 'directory' ? `${c.name}/` : c.name)).join('\n'));
};

const cat: CommandFn = (args, ctx) => {
  if (args.length === 0) return ok(ctx.stdin);

  const outputs: string[] = [];
  for (const path of args) {
    const node = ctx.fs.resolve(ctx.cwd, path);
    if (!node) return fail(`cat: '${path}': No such file or directory`);
    if (node.type === 'directory') return fail(`cat: '${path}': Is a directory`);
    outputs.push(node.content);
  }
  return ok(outputs.join('\n'));
};

const cd: CommandFn = (args, ctx) => {
  const target = args[0] || '~';
  if (target === '~' || target === '/') return ok('', {newCwd: '~'});

  const segs = ctx.fs.normalizePath(ctx.cwd, target);
  const node = ctx.fs.resolve('~', ctx.fs.segmentsToPath(segs));

  if (!node) return fail(`cd: '${target}': No such file or directory`);
  if (node.type !== 'directory') return fail(`cd: '${target}': Not a directory`);

  return ok('', {newCwd: ctx.fs.segmentsToPath(segs)});
};

const pwd: CommandFn = (_args, ctx) => ok(ctx.cwd);

const touch: CommandFn = (args, ctx) => {
  if (args.length === 0) return fail('touch: missing file operand');
  for (const path of args) {
    const error = ctx.fs.touch(ctx.cwd, path);
    if (error) return fail(`touch: ${error}`);
  }
  return ok('');
};

const mkdir: CommandFn = (args, ctx) => {
  const {flags, operands} = parseFlags(args, ['p']);
  if (operands.length === 0) return fail('mkdir: missing operand');
  for (const path of operands) {
    const error = ctx.fs.mkdir(ctx.cwd, path, flags.has('p'));
    if (error) return fail(`mkdir: ${error}`);
  }
  return ok('');
};

const rm: CommandFn = (args, ctx) => {
  const {flags, operands} = parseFlags(args, ['r', 'f']);
  if (operands.length === 0) return fail('rm: missing operand');
  for (const path of operands) {
    const error = ctx.fs.rm(ctx.cwd, path, flags.has('r'));
    if (error && !flags.has('f')) return fail(`rm: ${error}`);
  }
  return ok('');
};

const mv: CommandFn = (args, ctx) => {
  if (args.length < 2) return fail('mv: missing destination');
  const error = ctx.fs.mv(ctx.cwd, args[0], args[1]);
  if (error) return fail(`mv: ${error}`);
  return ok('');
};

const cp: CommandFn = (args, ctx) => {
  const {flags, operands} = parseFlags(args, ['r']);
  if (operands.length < 2) return fail('cp: missing destination');
  const error = ctx.fs.cp(ctx.cwd, operands[0], operands[1], flags.has('r'));
  if (error) return fail(`cp: ${error}`);
  return ok('');
};

// ─── Text processing commands ───

const echo: CommandFn = (args) => ok(args.join(' '));

const grep: CommandFn = (args, ctx) => {
  const {flags, operands} = parseFlags(args, ['i', 'n', 'c']);

  if (operands.length === 0) return fail('grep: missing pattern');
  const pattern = operands[0];
  const files = operands.slice(1);

  let text: string;
  if (files.length > 0) {
    const parts: string[] = [];
    for (const f of files) {
      const content = ctx.fs.readFile(ctx.cwd, f);
      if (content === null) return fail(`grep: '${f}': No such file or directory`);
      parts.push(content);
    }
    text = parts.join('\n');
  } else {
    text = ctx.stdin;
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.has('i') ? 'i' : '');
  } catch {
    return fail(`grep: invalid regex: '${pattern}'`);
  }

  const lines = text.split('\n');
  const matches: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      matches.push(flags.has('n') ? `${i + 1}:${lines[i]}` : lines[i]);
    }
  }

  if (flags.has('c')) return ok(String(matches.length));
  if (matches.length === 0) return {stdout: '', stderr: '', exitCode: 1};
  return ok(matches.join('\n'));
};

const head: CommandFn = (args, ctx) => {
  let count = 10;
  const filtered: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && i + 1 < args.length) {
      count = parseInt(args[i + 1], 10) || 10;
      i++;
    } else if (!args[i].startsWith('-')) {
      filtered.push(args[i]);
    }
  }

  const text = filtered.length > 0 ? ctx.fs.readFile(ctx.cwd, filtered[0]) : ctx.stdin;
  if (text === null && filtered.length > 0) return fail(`head: '${filtered[0]}': No such file or directory`);

  return ok((text ?? '').split('\n').slice(0, count).join('\n'));
};

const tail: CommandFn = (args, ctx) => {
  let count = 10;
  const filtered: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && i + 1 < args.length) {
      count = parseInt(args[i + 1], 10) || 10;
      i++;
    } else if (!args[i].startsWith('-')) {
      filtered.push(args[i]);
    }
  }

  const text = filtered.length > 0 ? ctx.fs.readFile(ctx.cwd, filtered[0]) : ctx.stdin;
  if (text === null && filtered.length > 0) return fail(`tail: '${filtered[0]}': No such file or directory`);

  const lines = (text ?? '').split('\n');
  return ok(lines.slice(-count).join('\n'));
};

const wc: CommandFn = (args, ctx) => {
  const {flags, operands} = parseFlags(args, ['l', 'w', 'c']);

  const text = operands.length > 0 ? ctx.fs.readFile(ctx.cwd, operands[0]) : ctx.stdin;
  if (text === null && operands.length > 0) return fail(`wc: '${operands[0]}': No such file or directory`);

  const content = text ?? '';
  const lineCount = content.split('\n').length;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const showAll = !flags.has('l') && !flags.has('w') && !flags.has('c');
  const parts: string[] = [];
  if (showAll || flags.has('l')) parts.push(String(lineCount));
  if (showAll || flags.has('w')) parts.push(String(wordCount));
  if (showAll || flags.has('c')) parts.push(String(charCount));
  if (operands.length > 0) parts.push(operands[0]);

  return ok(parts.join('\t'));
};

// ─── Editor commands ───

const vim: CommandFn = (args, ctx) => {
  if (args.length === 0) return fail('vim: missing file operand');
  const path = args[0];
  const node = ctx.fs.resolve(ctx.cwd, path);

  let content = '';
  let isReadonly = false;

  if (node) {
    if (node.type === 'directory') return fail(`vim: '${path}': Is a directory`);
    content = node.content;
    isReadonly = node.readonly;
  }

  // Build the absolute-ish path for display
  const segs = ctx.fs.normalizePath(ctx.cwd, path);
  const filePath = ctx.fs.segmentsToPath(segs);
  const fileName = segs[segs.length - 1] || path;

  return {
    stdout: '',
    stderr: '',
    exitCode: 0,
    vim: {filePath, fileName, content, readonly: isReadonly},
  };
};

// ─── Shell commands ───

const help: CommandFn = () =>
  ok(
    [
      'Available commands:',
      '',
      '  Navigation:',
      '    ls [-la] [path]     디렉토리 내용 보기',
      '    cd <dir>            디렉토리 이동',
      '    pwd                 현재 경로 출력',
      '',
      '  Files:',
      '    cat <file>          파일 내용 보기',
      '    vim <file>          텍스트 편집기 열기',
      '    touch <file>        빈 파일 생성',
      '    mkdir [-p] <dir>    디렉토리 생성',
      '    rm [-rf] <path>     파일/디렉토리 삭제',
      '    mv <src> <dst>      이동/이름 변경',
      '    cp [-r] <src> <dst> 복사',
      '',
      '  Text:',
      '    echo <text>         텍스트 출력',
      '    grep [-inc] <pat> [file]  패턴 검색',
      '    head [-n N] [file]  처음 N줄 보기',
      '    tail [-n N] [file]  마지막 N줄 보기',
      '    wc [-lwc] [file]    행/단어/문자 수',
      '',
      '  Shell:',
      '    whoami              사이트 소개',
      '    date                현재 날짜',
      '    history             명령어 히스토리',
      '    export KEY=VALUE    환경변수 설정',
      '    env                 환경변수 목록',
      '    clear / Ctrl+L      화면 지우기',
      '    help                이 도움말',
      '',
      '  Operators:',
      '    cmd1 | cmd2         파이프 (stdout → stdin)',
      '    cmd1 && cmd2        AND (앞 명령 성공 시)',
      '    cmd1 || cmd2        OR (앞 명령 실패 시)',
      '    cmd1 ; cmd2         순차 실행',
      '    echo text > file    파일에 쓰기',
      '    echo text >> file   파일에 추가',
      '    $VAR                환경변수 치환',
      '',
      '  Tab                   자동완성',
    ].join('\n'),
  );

const whoami: CommandFn = () =>
  ok(
    [
      'hongsoohyuk.com - 프론트엔드 개발자 홍수혁의 포트폴리오',
      '',
      'Built with Next.js, React, TypeScript',
      'Try: ls, cat about.txt, cat resume/resume.txt',
    ].join('\n'),
  );

const clear: CommandFn = () => ({stdout: '', stderr: '', exitCode: 0, clear: true});

const date: CommandFn = () => ok(new Date().toString());

const historyCmd: CommandFn = (_args, ctx) => {
  if (ctx.history.length === 0) return ok('(no history)');
  return ok(ctx.history.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`).join('\n'));
};

const exportCmd: CommandFn = (args, ctx) => {
  if (args.length === 0) {
    const lines = Object.entries(ctx.env).map(([k, v]) => `${k}=${v}`);
    return ok(lines.join('\n'));
  }

  const newEnv = {...ctx.env};
  for (const arg of args) {
    const eq = arg.indexOf('=');
    if (eq === -1) {
      const val = ctx.env[arg];
      return ok(val !== undefined ? `${arg}=${val}` : '');
    }
    newEnv[arg.slice(0, eq)] = arg.slice(eq + 1);
  }

  return ok('', {newEnv});
};

const envCmd: CommandFn = (_args, ctx) => {
  return ok(Object.entries(ctx.env).map(([k, v]) => `${k}=${v}`).join('\n'));
};

// ─── Command registry ───

export const COMMANDS: Record<string, CommandFn> = {
  ls,
  cat,
  cd,
  pwd,
  touch,
  mkdir,
  rm,
  rmdir: (args, ctx) => rm(['-r', ...args], ctx),
  mv,
  cp,
  echo,
  grep,
  head,
  tail,
  wc,
  vim,
  vi: vim,
  help,
  whoami,
  clear,
  date,
  history: historyCmd,
  export: exportCmd,
  env: envCmd,
};

export const COMMAND_NAMES = Object.keys(COMMANDS);

// ─── Flag parsing utility ───

function parseFlags(args: string[], validFlags: string[]): {flags: Set<string>; operands: string[]} {
  const flags = new Set<string>();
  const operands: string[] = [];
  let pastFlags = false;

  for (const arg of args) {
    if (pastFlags || !arg.startsWith('-') || arg === '-') {
      operands.push(arg);
      continue;
    }
    if (arg === '--') {
      pastFlags = true;
      continue;
    }
    for (const ch of arg.slice(1)) {
      if (validFlags.includes(ch)) flags.add(ch);
    }
  }

  return {flags, operands};
}
