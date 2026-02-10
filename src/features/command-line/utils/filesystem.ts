import type {CliData, DirectoryNode, FileNode, FileSystemNode, UserFSData} from '../types';

const STORAGE_KEY = 'hongsoohyuk-cli-fs';

// ─── VirtualFS: mutable in-memory filesystem with localStorage persistence ───

export class VirtualFS {
  private root: DirectoryNode;

  constructor(initialData: CliData) {
    this.root = buildInitialFS(initialData);
    this.loadUserData();
  }

  getRoot(): DirectoryNode {
    return this.root;
  }

  // ─── Path resolution ───

  resolve(cwd: string, path: string): FileSystemNode | null {
    const segs = this.normalizePath(cwd, path);
    let node: FileSystemNode = this.root;
    for (const s of segs) {
      if (node.type !== 'directory') return null;
      const child: FileSystemNode | undefined = node.children[s];
      if (!child) return null;
      node = child;
    }
    return node;
  }

  resolveParent(cwd: string, path: string): {parent: DirectoryNode; name: string} | null {
    const segs = this.normalizePath(cwd, path);
    if (segs.length === 0) return null;

    const name = segs[segs.length - 1];
    const parentSegs = segs.slice(0, -1);

    let node: FileSystemNode = this.root;
    for (const s of parentSegs) {
      if (node.type !== 'directory') return null;
      const child: FileSystemNode | undefined = node.children[s];
      if (!child) return null;
      node = child;
    }
    if (node.type !== 'directory') return null;
    return {parent: node, name};
  }

  // ─── Read operations ───

  readFile(cwd: string, path: string): string | null {
    const node = this.resolve(cwd, path);
    if (!node || node.type !== 'file') return null;
    return node.content;
  }

  list(cwd: string, path: string): FileSystemNode[] | null {
    const node = this.resolve(cwd, path);
    if (!node || node.type !== 'directory') return null;
    return Object.values(node.children);
  }

  exists(cwd: string, path: string): boolean {
    return this.resolve(cwd, path) !== null;
  }

  // ─── Write operations ───

  writeFile(cwd: string, path: string, content: string): string | null {
    const r = this.resolveParent(cwd, path);
    if (!r) return 'Invalid path';

    const existing = r.parent.children[r.name];
    if (existing) {
      if (existing.readonly) return `Permission denied: '${r.name}' is read-only`;
      if (existing.type === 'directory') return `Is a directory: '${r.name}'`;
      existing.content = content;
      existing.modifiedAt = Date.now();
    } else {
      r.parent.children[r.name] = mkFile(r.name, content);
    }

    this.persist();
    return null;
  }

  appendFile(cwd: string, path: string, content: string): string | null {
    const r = this.resolveParent(cwd, path);
    if (!r) return 'Invalid path';

    const existing = r.parent.children[r.name];
    if (existing) {
      if (existing.readonly) return `Permission denied: '${r.name}' is read-only`;
      if (existing.type === 'directory') return `Is a directory: '${r.name}'`;
      existing.content += content;
      existing.modifiedAt = Date.now();
    } else {
      r.parent.children[r.name] = mkFile(r.name, content);
    }

    this.persist();
    return null;
  }

  touch(cwd: string, path: string): string | null {
    const r = this.resolveParent(cwd, path);
    if (!r) return 'Invalid path';

    const existing = r.parent.children[r.name];
    if (existing) {
      if (existing.readonly) return `Permission denied: '${r.name}'`;
      existing.modifiedAt = Date.now();
    } else {
      r.parent.children[r.name] = mkFile(r.name, '');
    }

    this.persist();
    return null;
  }

  mkdir(cwd: string, path: string, parents = false): string | null {
    if (parents) return this.mkdirParents(cwd, path);

    const r = this.resolveParent(cwd, path);
    if (!r) return 'Invalid path';
    if (r.parent.children[r.name]) return `'${r.name}' already exists`;

    r.parent.children[r.name] = mkDir(r.name);
    this.persist();
    return null;
  }

  private mkdirParents(cwd: string, path: string): string | null {
    const segs = this.normalizePath(cwd, path);
    let current: FileSystemNode = this.root;

    for (const seg of segs) {
      if (current.type !== 'directory') return `'${seg}': Not a directory`;
      const child: FileSystemNode | undefined = current.children[seg];
      if (child) {
        if (child.type !== 'directory') return `'${seg}': Not a directory`;
        current = child;
      } else {
        const dir = mkDir(seg);
        current.children[seg] = dir;
        current = dir;
      }
    }

    this.persist();
    return null;
  }

  rm(cwd: string, path: string, recursive = false): string | null {
    const r = this.resolveParent(cwd, path);
    if (!r) return `No such file or directory: '${path}'`;

    const node = r.parent.children[r.name];
    if (!node) return `No such file or directory: '${path}'`;
    if (node.readonly) return `Permission denied: '${r.name}' is read-only`;

    if (node.type === 'directory') {
      if (!recursive) return `Is a directory: '${r.name}' (use rm -r)`;
      if (hasReadonly(node)) return 'Permission denied: contains read-only files';
    }

    delete r.parent.children[r.name];
    this.persist();
    return null;
  }

  mv(cwd: string, src: string, dst: string): string | null {
    const srcR = this.resolveParent(cwd, src);
    if (!srcR) return `No such file or directory: '${src}'`;

    const srcNode = srcR.parent.children[srcR.name];
    if (!srcNode) return `No such file or directory: '${src}'`;
    if (srcNode.readonly) return `Permission denied: '${srcR.name}' is read-only`;

    const dstNode = this.resolve(cwd, dst);
    if (dstNode && dstNode.type === 'directory') {
      if (dstNode.readonly) return 'Permission denied: destination is read-only';
      dstNode.children[srcR.name] = srcNode;
      delete srcR.parent.children[srcR.name];
      this.persist();
      return null;
    }

    const dstR = this.resolveParent(cwd, dst);
    if (!dstR) return `Invalid destination: '${dst}'`;

    dstR.parent.children[dstR.name] = {...srcNode, name: dstR.name, modifiedAt: Date.now()};
    delete srcR.parent.children[srcR.name];
    this.persist();
    return null;
  }

  cp(cwd: string, src: string, dst: string, recursive = false): string | null {
    const srcNode = this.resolve(cwd, src);
    if (!srcNode) return `No such file or directory: '${src}'`;
    if (srcNode.type === 'directory' && !recursive) return `Is a directory: '${src}' (use cp -r)`;

    const dstNode = this.resolve(cwd, dst);
    if (dstNode && dstNode.type === 'directory') {
      dstNode.children[srcNode.name] = cloneNode(srcNode);
      this.persist();
      return null;
    }

    const dstR = this.resolveParent(cwd, dst);
    if (!dstR) return `Invalid destination: '${dst}'`;

    dstR.parent.children[dstR.name] = {...cloneNode(srcNode), name: dstR.name};
    this.persist();
    return null;
  }

  // ─── Path utilities ───

  normalizePath(cwd: string, target: string): string[] {
    const isAbsolute = target.startsWith('~') || target.startsWith('/');
    const base = isAbsolute ? [] : cwdSegments(cwd);
    const parts = target
      .replace(/^~\/?/, '')
      .replace(/^\//, '')
      .split('/')
      .filter(Boolean);

    const result = [...base];
    for (const p of parts) {
      if (p === '.') continue;
      else if (p === '..') result.pop();
      else result.push(p);
    }
    return result;
  }

  segmentsToPath(segs: string[]): string {
    return segs.length === 0 ? '~' : `~/${segs.join('/')}`;
  }

  /** Return completions for a partial path */
  completePath(cwd: string, partial: string): string[] {
    const lastSlash = partial.lastIndexOf('/');
    const dirPart = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : '';
    const prefix = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial;

    const dirPath = dirPart || '.';
    const node = this.resolve(cwd, dirPath);
    if (!node || node.type !== 'directory') return [];

    return Object.values(node.children)
      .filter((child) => child.name.startsWith(prefix))
      .map((child) => {
        const suffix = child.type === 'directory' ? '/' : '';
        return dirPart + child.name + suffix;
      })
      .sort();
  }

  // ─── Persistence ───

  private persist(): void {
    try {
      const entries: Record<string, {type: 'file'; content: string} | {type: 'directory'}> = {};
      collectUserEntries(this.root, [], entries);
      const data: UserFSData = {version: 1, entries};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage unavailable
    }
  }

  private loadUserData(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as UserFSData;
      if (data.version !== 1) return;
      restoreUserEntries(this.root, data.entries);
    } catch {
      // localStorage unavailable or corrupted
    }
  }
}

// ─── Build initial filesystem from server data ───

function toFileName(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 60) + '.txt'
  );
}

function buildInitialFS(data: CliData): DirectoryNode {
  const now = Date.now();

  const blogChildren: Record<string, FileNode> = {};
  for (const post of data.blogPosts) {
    const name = toFileName(post.title);
    const cats = post.categories.length > 0 ? `[${post.categories.join(', ')}]` : '';
    blogChildren[name] = mkReadonlyFile(
      name,
      [
        `title: ${post.title}`,
        cats ? `categories: ${cats}` : '',
        '---',
        '',
        post.excerpt || '(내용 없음)',
        '',
        `> 전체 내용: /blog/${post.slug}`,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  const projChildren: Record<string, FileNode> = {};
  for (const proj of data.projects) {
    const name = toFileName(proj.title);
    projChildren[name] = mkReadonlyFile(
      name,
      [`title: ${proj.title}`, '---', '', `> 전체 내용: /project/${proj.slug}`].join('\n'),
    );
  }

  return {
    type: 'directory',
    name: '~',
    children: {
      'about.txt': mkReadonlyFile(
        'about.txt',
        [
          '================================',
          '  홍수혁 (Hong Soohyuk)',
          '  Frontend Developer',
          '================================',
          '',
          'React, Next.js, TypeScript를 주로 사용하는',
          '프론트엔드 개발자입니다.',
          '',
          'Contact:',
          '  email   : hongsoohyuk@icloud.com',
          '  github  : github.com/hong-soohyuk',
          '  linkedin: linkedin.com/in/hong-soohyuk',
        ].join('\n'),
      ),
      resume: mkReadonlyDir('resume', {
        'resume.txt': mkReadonlyFile('resume.txt', data.resumeText),
      }),
      blog: mkReadonlyDir('blog', blogChildren),
      project: mkReadonlyDir('project', projChildren),
      guestbook: mkReadonlyDir('guestbook', {
        'info.txt': mkReadonlyFile(
          'info.txt',
          [
            '================================',
            '  방명록 (Guestbook)',
            '================================',
            '',
            '방문자들이 남겨준 소중한 메시지를 확인하세요.',
            '',
            '> 방명록 작성은 웹에서만 가능합니다: /guestbook',
          ].join('\n'),
        ),
      }),
    },
    readonly: true,
    createdAt: now,
    modifiedAt: now,
  };
}

// ─── Node constructors ───

function mkFile(name: string, content: string): FileNode {
  const now = Date.now();
  return {type: 'file', name, content, readonly: false, createdAt: now, modifiedAt: now};
}

function mkReadonlyFile(name: string, content: string): FileNode {
  const now = Date.now();
  return {type: 'file', name, content, readonly: true, createdAt: now, modifiedAt: now};
}

function mkDir(name: string): DirectoryNode {
  const now = Date.now();
  return {type: 'directory', name, children: {}, readonly: false, createdAt: now, modifiedAt: now};
}

function mkReadonlyDir(name: string, children: Record<string, FileSystemNode>): DirectoryNode {
  const now = Date.now();
  return {type: 'directory', name, children, readonly: true, createdAt: now, modifiedAt: now};
}

function cwdSegments(cwd: string): string[] {
  return cwd
    .replace(/^~\/?/, '')
    .split('/')
    .filter(Boolean);
}

function hasReadonly(node: FileSystemNode): boolean {
  if (node.readonly) return true;
  if (node.type === 'directory') {
    return Object.values(node.children).some(hasReadonly);
  }
  return false;
}

function cloneNode(node: FileSystemNode): FileSystemNode {
  const now = Date.now();
  if (node.type === 'file') {
    return {...node, readonly: false, createdAt: now, modifiedAt: now};
  }
  const children: Record<string, FileSystemNode> = {};
  for (const [k, v] of Object.entries(node.children)) {
    children[k] = cloneNode(v);
  }
  return {...node, children, readonly: false, createdAt: now, modifiedAt: now};
}

/** Recursively collect non-readonly entries for persistence */
function collectUserEntries(
  node: DirectoryNode,
  pathParts: string[],
  out: Record<string, {type: 'file'; content: string} | {type: 'directory'}>,
): void {
  for (const [name, child] of Object.entries(node.children)) {
    if (child.readonly) continue;
    const fullPath = [...pathParts, name].join('/');
    if (child.type === 'file') {
      out[fullPath] = {type: 'file', content: child.content};
    } else {
      out[fullPath] = {type: 'directory'};
      collectUserEntries(child, [...pathParts, name], out);
    }
  }
}

/** Restore user-created entries into the filesystem */
function restoreUserEntries(
  root: DirectoryNode,
  entries: Record<string, {type: 'file'; content: string} | {type: 'directory'}>,
): void {
  const paths = Object.keys(entries).sort((a, b) => a.split('/').length - b.split('/').length);

  for (const path of paths) {
    const entry = entries[path];
    const parts = path.split('/');
    const name = parts[parts.length - 1];
    const parentParts = parts.slice(0, -1);

    let current: FileSystemNode = root;
    let valid = true;
    for (const seg of parentParts) {
      if (current.type !== 'directory') {
        valid = false;
        break;
      }
      const child: FileSystemNode | undefined = current.children[seg];
      if (!child) {
        valid = false;
        break;
      }
      current = child;
    }

    if (!valid || current.type !== 'directory') continue;
    if (current.children[name]?.readonly) continue;

    if (entry.type === 'file') {
      current.children[name] = mkFile(name, entry.content);
    } else {
      if (!current.children[name]) {
        current.children[name] = mkDir(name);
      }
    }
  }
}
