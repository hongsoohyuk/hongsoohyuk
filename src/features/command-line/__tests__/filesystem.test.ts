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

function createFS() {
  localStorageMock.clear();
  return new VirtualFS(MOCK_DATA);
}

describe('VirtualFS', () => {
  describe('initial structure', () => {
    it('creates root with expected directories', () => {
      const fs = createFS();
      const root = fs.getRoot();
      expect(root.type).toBe('directory');
      expect(root.children['about.txt']).toBeDefined();
      expect(root.children['blog']).toBeDefined();
      expect(root.children['project']).toBeDefined();
      expect(root.children['resume']).toBeDefined();
    });

    it('creates blog files from data', () => {
      const fs = createFS();
      const blog = fs.resolve('~', 'blog');
      expect(blog?.type).toBe('directory');
      if (blog?.type === 'directory') {
        const files = Object.keys(blog.children);
        expect(files.length).toBe(1);
        expect(files[0]).toMatch(/hello_world\.txt/);
      }
    });
  });

  describe('resolve', () => {
    it('resolves absolute path from ~', () => {
      const fs = createFS();
      const node = fs.resolve('~', '~/about.txt');
      expect(node?.type).toBe('file');
    });

    it('resolves relative path from cwd', () => {
      const fs = createFS();
      const node = fs.resolve('~', 'about.txt');
      expect(node?.type).toBe('file');
    });

    it('resolves nested path', () => {
      const fs = createFS();
      const node = fs.resolve('~', 'resume/resume.txt');
      expect(node?.type).toBe('file');
      if (node?.type === 'file') {
        expect(node.content).toBe('Frontend Developer');
      }
    });

    it('returns null for non-existent path', () => {
      const fs = createFS();
      expect(fs.resolve('~', 'nonexistent')).toBeNull();
    });

    it('handles .. in path', () => {
      const fs = createFS();
      const node = fs.resolve('~/blog', '../about.txt');
      expect(node?.type).toBe('file');
    });
  });

  describe('readFile', () => {
    it('reads file content', () => {
      const fs = createFS();
      const content = fs.readFile('~', 'about.txt');
      expect(content).toContain('홍수혁');
    });

    it('returns null for directory', () => {
      const fs = createFS();
      expect(fs.readFile('~', 'blog')).toBeNull();
    });

    it('returns null for non-existent file', () => {
      const fs = createFS();
      expect(fs.readFile('~', 'no-file.txt')).toBeNull();
    });
  });

  describe('writeFile / appendFile', () => {
    it('creates a new file', () => {
      const fs = createFS();
      const err = fs.writeFile('~', 'new.txt', 'content');
      expect(err).toBeNull();
      expect(fs.readFile('~', 'new.txt')).toBe('content');
    });

    it('overwrites existing writable file', () => {
      const fs = createFS();
      fs.writeFile('~', 'test.txt', 'old');
      fs.writeFile('~', 'test.txt', 'new');
      expect(fs.readFile('~', 'test.txt')).toBe('new');
    });

    it('rejects write to readonly file', () => {
      const fs = createFS();
      const err = fs.writeFile('~', 'about.txt', 'hacked');
      expect(err).toContain('read-only');
    });

    it('appends to existing file', () => {
      const fs = createFS();
      fs.writeFile('~', 'log.txt', 'line1\n');
      fs.appendFile('~', 'log.txt', 'line2\n');
      expect(fs.readFile('~', 'log.txt')).toBe('line1\nline2\n');
    });

    it('creates file on append if not exists', () => {
      const fs = createFS();
      fs.appendFile('~', 'new-append.txt', 'data');
      expect(fs.readFile('~', 'new-append.txt')).toBe('data');
    });
  });

  describe('touch', () => {
    it('creates empty file if not exists', () => {
      const fs = createFS();
      const err = fs.touch('~', 'touched.txt');
      expect(err).toBeNull();
      expect(fs.readFile('~', 'touched.txt')).toBe('');
    });

    it('updates modifiedAt on existing writable file', () => {
      const fs = createFS();
      fs.writeFile('~', 'f.txt', 'x');
      const before = (fs.resolve('~', 'f.txt') as {modifiedAt: number}).modifiedAt;
      // Small delay
      fs.touch('~', 'f.txt');
      const after = (fs.resolve('~', 'f.txt') as {modifiedAt: number}).modifiedAt;
      expect(after).toBeGreaterThanOrEqual(before);
    });

    it('rejects touch on readonly file', () => {
      const fs = createFS();
      const err = fs.touch('~', 'about.txt');
      expect(err).toContain('Permission denied');
    });
  });

  describe('mkdir', () => {
    it('creates a directory', () => {
      const fs = createFS();
      const err = fs.mkdir('~', 'newdir');
      expect(err).toBeNull();
      const node = fs.resolve('~', 'newdir');
      expect(node?.type).toBe('directory');
    });

    it('fails if directory already exists', () => {
      const fs = createFS();
      fs.mkdir('~', 'mydir');
      const err = fs.mkdir('~', 'mydir');
      expect(err).toContain('already exists');
    });

    it('creates nested directories with -p flag', () => {
      const fs = createFS();
      const err = fs.mkdir('~', 'a/b/c', true);
      expect(err).toBeNull();
      expect(fs.resolve('~', 'a/b/c')?.type).toBe('directory');
    });
  });

  describe('rm', () => {
    it('removes a file', () => {
      const fs = createFS();
      fs.writeFile('~', 'delete-me.txt', 'bye');
      const err = fs.rm('~', 'delete-me.txt');
      expect(err).toBeNull();
      expect(fs.resolve('~', 'delete-me.txt')).toBeNull();
    });

    it('fails to remove directory without -r', () => {
      const fs = createFS();
      fs.mkdir('~', 'somedir');
      const err = fs.rm('~', 'somedir');
      expect(err).toContain('Is a directory');
    });

    it('removes directory recursively', () => {
      const fs = createFS();
      fs.mkdir('~', 'parent');
      fs.writeFile('~/parent', 'child.txt', 'data');
      const err = fs.rm('~', 'parent', true);
      expect(err).toBeNull();
      expect(fs.resolve('~', 'parent')).toBeNull();
    });

    it('rejects removal of readonly file', () => {
      const fs = createFS();
      const err = fs.rm('~', 'about.txt');
      expect(err).toContain('read-only');
    });

    it('returns error for non-existent path', () => {
      const fs = createFS();
      const err = fs.rm('~', 'ghost.txt');
      expect(err).toContain('No such file');
    });
  });

  describe('mv', () => {
    it('renames a file', () => {
      const fs = createFS();
      fs.writeFile('~', 'old.txt', 'content');
      const err = fs.mv('~', 'old.txt', 'new.txt');
      expect(err).toBeNull();
      expect(fs.resolve('~', 'old.txt')).toBeNull();
      expect(fs.readFile('~', 'new.txt')).toBe('content');
    });

    it('moves file into directory', () => {
      const fs = createFS();
      fs.writeFile('~', 'move-me.txt', 'data');
      fs.mkdir('~', 'dest');
      const err = fs.mv('~', 'move-me.txt', 'dest');
      expect(err).toBeNull();
      expect(fs.readFile('~/dest', 'move-me.txt')).toBe('data');
    });

    it('fails for non-existent source', () => {
      const fs = createFS();
      const err = fs.mv('~', 'nope.txt', 'whatever.txt');
      expect(err).toContain('No such file');
    });
  });

  describe('cp', () => {
    it('copies a file', () => {
      const fs = createFS();
      fs.writeFile('~', 'src.txt', 'original');
      const err = fs.cp('~', 'src.txt', 'dst.txt');
      expect(err).toBeNull();
      expect(fs.readFile('~', 'dst.txt')).toBe('original');
      // Source still exists
      expect(fs.readFile('~', 'src.txt')).toBe('original');
    });

    it('copies file into directory', () => {
      const fs = createFS();
      fs.writeFile('~', 'f.txt', 'data');
      fs.mkdir('~', 'target');
      const err = fs.cp('~', 'f.txt', 'target');
      expect(err).toBeNull();
      expect(fs.readFile('~/target', 'f.txt')).toBe('data');
    });

    it('fails to copy directory without -r', () => {
      const fs = createFS();
      fs.mkdir('~', 'srcdir');
      const err = fs.cp('~', 'srcdir', 'dstdir');
      expect(err).toContain('Is a directory');
    });

    it('copies directory recursively', () => {
      const fs = createFS();
      fs.mkdir('~', 'srcdir');
      fs.writeFile('~/srcdir', 'f.txt', 'nested');
      const err = fs.cp('~', 'srcdir', 'dstdir', true);
      expect(err).toBeNull();
      expect(fs.readFile('~/dstdir', 'f.txt')).toBe('nested');
    });
  });

  describe('normalizePath', () => {
    it('resolves relative path from cwd', () => {
      const fs = createFS();
      expect(fs.normalizePath('~/blog', 'hello.txt')).toEqual(['blog', 'hello.txt']);
    });

    it('resolves absolute ~ path', () => {
      const fs = createFS();
      expect(fs.normalizePath('~/blog', '~/resume')).toEqual(['resume']);
    });

    it('resolves . and ..', () => {
      const fs = createFS();
      expect(fs.normalizePath('~/a/b', '../c')).toEqual(['a', 'c']);
      expect(fs.normalizePath('~/a', './b')).toEqual(['a', 'b']);
    });

    it('resolves to root for ~', () => {
      const fs = createFS();
      expect(fs.normalizePath('~/blog', '~')).toEqual([]);
    });
  });

  describe('completePath', () => {
    it('completes files in cwd', () => {
      const fs = createFS();
      const completions = fs.completePath('~', 'ab');
      expect(completions).toContain('about.txt');
    });

    it('completes directories with trailing /', () => {
      const fs = createFS();
      const completions = fs.completePath('~', 'bl');
      expect(completions).toContain('blog/');
    });

    it('returns empty for no match', () => {
      const fs = createFS();
      expect(fs.completePath('~', 'zzz')).toEqual([]);
    });
  });
});
