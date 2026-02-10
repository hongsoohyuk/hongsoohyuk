import {COMMANDS, COMMAND_NAMES} from '../utils/commands';
import {VirtualFS} from '../utils/filesystem';

import type {CliData, CommandResult, ExecContext} from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {value: localStorageMock});

const MOCK_DATA: CliData = {
  blogPosts: [{slug: 'hello', title: 'Hello World', excerpt: 'My first post', categories: ['dev']}],
  projects: [{slug: 'proj1', title: 'Project One'}],
  resumeText: 'Frontend Developer',
};

function createCtx(overrides?: Partial<ExecContext & {fs: VirtualFS; cwd: string}>) {
  localStorageMock.clear();
  const fs = new VirtualFS(MOCK_DATA);
  return {
    fs,
    cwd: '~',
    stdin: '',
    env: {USER: 'hong', HOME: '~', SHELL: '/bin/bash'},
    history: [],
    ...overrides,
  };
}

function run(name: string, args: string[], ctxOverrides?: Partial<ExecContext & {fs: VirtualFS; cwd: string}>) {
  const handler = COMMANDS[name];
  if (!handler) throw new Error(`Command "${name}" not found`);
  return handler(args, createCtx(ctxOverrides));
}

describe('Commands', () => {
  describe('COMMAND_NAMES', () => {
    it('includes all expected commands', () => {
      expect(COMMAND_NAMES).toContain('ls');
      expect(COMMAND_NAMES).toContain('cat');
      expect(COMMAND_NAMES).toContain('cd');
      expect(COMMAND_NAMES).toContain('grep');
      expect(COMMAND_NAMES).toContain('vim');
      expect(COMMAND_NAMES).toContain('donut');
      expect(COMMAND_NAMES).toContain('help');
    });

    it('has vi as alias for vim', () => {
      expect(COMMANDS['vi']).toBe(COMMANDS['vim']);
    });
  });

  describe('echo', () => {
    it('joins arguments with spaces', () => {
      const result = run('echo', ['hello', 'world']);
      expect(result.stdout).toBe('hello world');
      expect(result.exitCode).toBe(0);
    });

    it('returns empty for no args', () => {
      const result = run('echo', []);
      expect(result.stdout).toBe('');
    });
  });

  describe('pwd', () => {
    it('returns current working directory', () => {
      const result = run('pwd', []);
      expect(result.stdout).toBe('~');
    });

    it('returns nested cwd', () => {
      const result = run('pwd', [], {cwd: '~/blog'});
      expect(result.stdout).toBe('~/blog');
    });
  });

  describe('ls', () => {
    it('lists root directory contents', () => {
      const result = run('ls', []);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('blog/');
      expect(result.stdout).toContain('about.txt');
    });

    it('lists specific directory', () => {
      const result = run('ls', ['blog']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('.txt');
    });

    it('errors for non-existent path', () => {
      const result = run('ls', ['nonexistent']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No such file');
    });

    it('shows long format with -l', () => {
      const result = run('ls', ['-l']);
      expect(result.stdout).toMatch(/r--/);
    });

    it('shows single file name for file argument', () => {
      const result = run('ls', ['about.txt']);
      expect(result.stdout).toBe('about.txt');
    });
  });

  describe('cat', () => {
    it('reads file content', () => {
      const result = run('cat', ['about.txt']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('홍수혁');
    });

    it('returns stdin when no args', () => {
      const result = run('cat', [], {stdin: 'piped data'});
      expect(result.stdout).toBe('piped data');
    });

    it('errors for directory', () => {
      const result = run('cat', ['blog']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Is a directory');
    });

    it('errors for non-existent file', () => {
      const result = run('cat', ['ghost.txt']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No such file');
    });
  });

  describe('cd', () => {
    it('changes to home on no args', () => {
      const result = run('cd', [], {cwd: '~/blog'});
      expect(result.newCwd).toBe('~');
    });

    it('changes to specified directory', () => {
      const result = run('cd', ['blog']);
      expect(result.newCwd).toBe('~/blog');
    });

    it('errors for non-existent directory', () => {
      const result = run('cd', ['nonexistent']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('No such file');
    });

    it('errors when target is a file', () => {
      const result = run('cd', ['about.txt']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Not a directory');
    });
  });

  describe('touch', () => {
    it('creates empty file', () => {
      const ctx = createCtx();
      COMMANDS['touch'](['newfile.txt'], ctx);
      expect(ctx.fs.readFile('~', 'newfile.txt')).toBe('');
    });

    it('errors with no arguments', () => {
      const result = run('touch', []);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('missing file operand');
    });
  });

  describe('mkdir', () => {
    it('creates directory', () => {
      const ctx = createCtx();
      const result = COMMANDS['mkdir'](['testdir'], ctx);
      expect(result.exitCode).toBe(0);
      expect(ctx.fs.resolve('~', 'testdir')?.type).toBe('directory');
    });

    it('creates nested with -p', () => {
      const ctx = createCtx();
      const result = COMMANDS['mkdir'](['-p', 'a/b/c'], ctx);
      expect(result.exitCode).toBe(0);
      expect(ctx.fs.resolve('~', 'a/b/c')?.type).toBe('directory');
    });

    it('errors with no args', () => {
      const result = run('mkdir', []);
      expect(result.exitCode).toBe(1);
    });
  });

  describe('rm', () => {
    it('removes a file', () => {
      const ctx = createCtx();
      ctx.fs.writeFile('~', 'temp.txt', 'x');
      const result = COMMANDS['rm'](['temp.txt'], ctx);
      expect(result.exitCode).toBe(0);
      expect(ctx.fs.resolve('~', 'temp.txt')).toBeNull();
    });

    it('requires -r for directory', () => {
      const ctx = createCtx();
      ctx.fs.mkdir('~', 'mydir');
      const result = COMMANDS['rm'](['mydir'], ctx);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('use rm -r');
    });

    it('removes directory with -r', () => {
      const ctx = createCtx();
      ctx.fs.mkdir('~', 'mydir');
      ctx.fs.writeFile('~/mydir', 'f.txt', 'data');
      const result = COMMANDS['rm'](['-r', 'mydir'], ctx);
      expect(result.exitCode).toBe(0);
    });

    it('-f ignores non-existent files', () => {
      const result = run('rm', ['-f', 'nonexistent.txt']);
      expect(result.exitCode).toBe(0);
    });

    it('errors with no args', () => {
      const result = run('rm', []);
      expect(result.exitCode).toBe(1);
    });
  });

  describe('mv', () => {
    it('renames a file', () => {
      const ctx = createCtx();
      ctx.fs.writeFile('~', 'a.txt', 'content');
      const result = COMMANDS['mv'](['a.txt', 'b.txt'], ctx);
      expect(result.exitCode).toBe(0);
      expect(ctx.fs.readFile('~', 'b.txt')).toBe('content');
    });

    it('errors with missing destination', () => {
      const result = run('mv', ['a.txt']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('missing destination');
    });
  });

  describe('cp', () => {
    it('copies a file', () => {
      const ctx = createCtx();
      ctx.fs.writeFile('~', 'orig.txt', 'data');
      const result = COMMANDS['cp'](['orig.txt', 'copy.txt'], ctx);
      expect(result.exitCode).toBe(0);
      expect(ctx.fs.readFile('~', 'copy.txt')).toBe('data');
    });

    it('errors with missing destination', () => {
      const result = run('cp', ['a.txt']);
      expect(result.exitCode).toBe(1);
    });
  });

  describe('grep', () => {
    it('matches lines from stdin', () => {
      const result = run('grep', ['hello'], {stdin: 'hello world\nfoo bar\nhello again'});
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('hello world\nhello again');
    });

    it('case-insensitive with -i', () => {
      const result = run('grep', ['-i', 'HELLO'], {stdin: 'Hello World\nfoo'});
      expect(result.stdout).toBe('Hello World');
    });

    it('shows line numbers with -n', () => {
      const result = run('grep', ['-n', 'b'], {stdin: 'a\nb\nc'});
      expect(result.stdout).toBe('2:b');
    });

    it('counts matches with -c', () => {
      const result = run('grep', ['-c', 'a'], {stdin: 'a\nb\na'});
      expect(result.stdout).toBe('2');
    });

    it('returns exit code 1 for no matches', () => {
      const result = run('grep', ['xyz'], {stdin: 'abc'});
      expect(result.exitCode).toBe(1);
    });

    it('errors for missing pattern', () => {
      const result = run('grep', []);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('missing pattern');
    });

    it('reads from file', () => {
      const ctx = createCtx();
      ctx.fs.writeFile('~', 'test.txt', 'line1\nline2\nline3');
      const result = COMMANDS['grep'](['line2', 'test.txt'], ctx);
      expect(result.stdout).toBe('line2');
    });
  });

  describe('head', () => {
    it('returns first 10 lines by default', () => {
      const lines = Array.from({length: 20}, (_, i) => `line${i + 1}`);
      const result = run('head', [], {stdin: lines.join('\n')});
      expect(result.stdout.split('\n')).toHaveLength(10);
    });

    it('returns first N lines with -n', () => {
      const result = run('head', ['-n', '3'], {stdin: 'a\nb\nc\nd\ne'});
      expect(result.stdout).toBe('a\nb\nc');
    });
  });

  describe('tail', () => {
    it('returns last 10 lines by default', () => {
      const lines = Array.from({length: 20}, (_, i) => `line${i + 1}`);
      const result = run('tail', [], {stdin: lines.join('\n')});
      expect(result.stdout.split('\n')).toHaveLength(10);
      expect(result.stdout).toContain('line20');
    });

    it('returns last N lines with -n', () => {
      const result = run('tail', ['-n', '2'], {stdin: 'a\nb\nc\nd'});
      expect(result.stdout).toBe('c\nd');
    });
  });

  describe('wc', () => {
    it('counts lines, words, chars', () => {
      const result = run('wc', [], {stdin: 'hello world\nfoo'});
      const parts = result.stdout.split('\t');
      expect(parts[0]).toBe('2'); // lines
      expect(parts[1]).toBe('3'); // words
      expect(parts[2]).toBe('15'); // chars
    });

    it('counts only lines with -l', () => {
      const result = run('wc', ['-l'], {stdin: 'a\nb\nc'});
      expect(result.stdout).toBe('3');
    });

    it('counts only words with -w', () => {
      const result = run('wc', ['-w'], {stdin: 'one two three'});
      expect(result.stdout).toBe('3');
    });
  });

  describe('vim', () => {
    it('opens vim for a file', () => {
      const result = run('vim', ['about.txt']);
      expect(result.vim).toBeDefined();
      expect(result.vim?.fileName).toBe('about.txt');
      expect(result.vim?.content).toContain('홍수혁');
      expect(result.vim?.readonly).toBe(true);
    });

    it('opens vim for new file', () => {
      const result = run('vim', ['new.txt']);
      expect(result.vim).toBeDefined();
      expect(result.vim?.content).toBe('');
      expect(result.vim?.readonly).toBe(false);
    });

    it('errors for directory', () => {
      const result = run('vim', ['blog']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Is a directory');
    });

    it('errors with no args', () => {
      const result = run('vim', []);
      expect(result.exitCode).toBe(1);
    });
  });

  describe('donut', () => {
    it('returns donut flag', () => {
      const result = run('donut', []);
      expect(result.donut).toBe(true);
    });
  });

  describe('clear', () => {
    it('returns clear flag', () => {
      const result = run('clear', []);
      expect(result.clear).toBe(true);
    });
  });

  describe('whoami', () => {
    it('returns site info', () => {
      const result = run('whoami', []);
      expect(result.stdout).toContain('hongsoohyuk');
    });
  });

  describe('help', () => {
    it('returns help text', () => {
      const result = run('help', []);
      expect(result.stdout).toContain('Available commands');
      expect(result.stdout).toContain('ls');
    });
  });

  describe('history', () => {
    it('returns history entries', () => {
      const result = run('history', [], {history: ['ls', 'pwd', 'echo hi']});
      expect(result.stdout).toContain('ls');
      expect(result.stdout).toContain('pwd');
      expect(result.stdout).toContain('echo hi');
    });

    it('returns no history message when empty', () => {
      const result = run('history', []);
      expect(result.stdout).toBe('(no history)');
    });
  });

  describe('export', () => {
    it('sets environment variable', () => {
      const result = run('export', ['FOO=bar']);
      expect(result.newEnv?.FOO).toBe('bar');
    });

    it('lists env when no args', () => {
      const result = run('export', []);
      expect(result.stdout).toContain('USER=hong');
    });

    it('shows single variable value', () => {
      const result = run('export', ['USER']);
      expect(result.stdout).toBe('USER=hong');
    });
  });

  describe('env', () => {
    it('lists all environment variables', () => {
      const result = run('env', []);
      expect(result.stdout).toContain('USER=hong');
      expect(result.stdout).toContain('SHELL=/bin/bash');
    });
  });

  describe('date', () => {
    it('returns current date string', () => {
      const result = run('date', []);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(0);
    });
  });
});
