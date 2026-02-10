import {execute} from '../utils/executor';
import {VirtualFS} from '../utils/filesystem';

import type {CliData} from '../types';

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

function createState() {
  localStorageMock.clear();
  return {
    fs: new VirtualFS(MOCK_DATA),
    cwd: '~',
    env: {USER: 'hong', HOME: '~'},
    history: [] as string[],
  };
}

describe('execute (integration)', () => {
  describe('basic execution', () => {
    it('returns empty output for empty input', () => {
      const result = execute('', createState());
      expect(result.output).toBe('');
      expect(result.isError).toBe(false);
    });

    it('returns empty output for whitespace-only input', () => {
      const result = execute('   ', createState());
      expect(result.output).toBe('');
      expect(result.isError).toBe(false);
    });

    it('executes echo', () => {
      const result = execute('echo hello world', createState());
      expect(result.output).toBe('hello world');
      expect(result.isError).toBe(false);
    });

    it('executes pwd', () => {
      const result = execute('pwd', createState());
      expect(result.output).toBe('~');
    });
  });

  describe('command not found', () => {
    it('returns error for unknown command', () => {
      const result = execute('nonexistent', createState());
      expect(result.isError).toBe(true);
      expect(result.output).toContain('command not found');
    });
  });

  describe('pipes', () => {
    it('pipes echo into grep', () => {
      const state = createState();
      state.fs.writeFile('~', 'data.txt', 'apple\nbanana\napricot');
      const result = execute('cat data.txt | grep ap', state);
      expect(result.output).toBe('apple\napricot');
    });

    it('pipes echo into wc', () => {
      const result = execute('echo hello world | wc -w', createState());
      expect(result.output).toBe('2');
    });

    it('three-stage pipeline', () => {
      const state = createState();
      state.fs.writeFile('~', 'lines.txt', 'a\nb\nc\nd\ne');
      const result = execute('cat lines.txt | head -n 3 | tail -n 1', state);
      expect(result.output).toBe('c');
    });
  });

  describe('AND (&&)', () => {
    it('runs second command on success', () => {
      const result = execute('echo ok && echo done', createState());
      expect(result.output).toContain('ok');
      expect(result.output).toContain('done');
    });

    it('stops on first failure', () => {
      const result = execute('cat nonexistent && echo should-not-run', createState());
      expect(result.output).toContain('No such file');
      expect(result.output).not.toContain('should-not-run');
    });
  });

  describe('OR (||)', () => {
    it('skips second command on success', () => {
      const result = execute('echo ok || echo fallback', createState());
      expect(result.output).toBe('ok');
      expect(result.output).not.toContain('fallback');
    });

    it('runs second command on failure', () => {
      const result = execute('cat nonexistent || echo fallback', createState());
      expect(result.output).toContain('fallback');
    });
  });

  describe('semicolons', () => {
    it('runs all commands sequentially', () => {
      const result = execute('echo a ; echo b ; echo c', createState());
      expect(result.output).toContain('a');
      expect(result.output).toContain('b');
      expect(result.output).toContain('c');
    });
  });

  describe('redirects', () => {
    it('redirects output to file with >', () => {
      const state = createState();
      execute('echo hello > output.txt', state);
      expect(state.fs.readFile('~', 'output.txt')).toBe('hello\n');
    });

    it('appends output to file with >>', () => {
      const state = createState();
      execute('echo line1 > log.txt', state);
      execute('echo line2 >> log.txt', state);
      expect(state.fs.readFile('~', 'log.txt')).toBe('line1\nline2\n');
    });

    it('redirect consumes stdout (no output)', () => {
      const state = createState();
      const result = execute('echo hello > file.txt', state);
      expect(result.output).toBe('');
    });
  });

  describe('variable expansion', () => {
    it('expands $USER', () => {
      const result = execute('echo $USER', createState());
      expect(result.output).toBe('hong');
    });

    it('expands ${VAR}', () => {
      const result = execute('echo ${HOME}', createState());
      expect(result.output).toBe('~');
    });
  });

  describe('side effects', () => {
    it('cd updates cwd', () => {
      const result = execute('cd blog', createState());
      expect(result.newCwd).toBe('~/blog');
    });

    it('clear returns clear flag', () => {
      const result = execute('clear', createState());
      expect(result.clear).toBe(true);
    });

    it('vim returns vim request', () => {
      const result = execute('vim about.txt', createState());
      expect(result.vim).toBeDefined();
      expect(result.vim?.fileName).toBe('about.txt');
    });

    it('donut returns donut flag', () => {
      const result = execute('donut', createState());
      expect(result.donut).toBe(true);
    });

    it('export updates env', () => {
      const result = execute('export FOO=bar', createState());
      expect(result.newEnv?.FOO).toBe('bar');
    });
  });

  describe('complex scenarios', () => {
    it('cd && pwd shows new directory', () => {
      const result = execute('cd blog && pwd', createState());
      expect(result.output).toContain('~/blog');
    });

    it('mkdir && touch && cat creates and reads file', () => {
      const state = createState();
      execute('mkdir testdir', state);
      execute('echo content > testdir/file.txt', state);
      const result = execute('cat testdir/file.txt', state);
      expect(result.output).toBe('content\n');
    });
  });
});
