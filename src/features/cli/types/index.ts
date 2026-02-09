// === Lexer Types ===
export type TokenType =
  | 'WORD'
  | 'PIPE'
  | 'REDIRECT_OUT'
  | 'REDIRECT_APPEND'
  | 'SEMICOLON'
  | 'AND'
  | 'OR'
  | 'EOF';

export type Token = {
  type: TokenType;
  value: string;
};

// === Parser Types (AST) ===
export type Redirect = {
  type: '>' | '>>';
  target: string;
};

export type SimpleCommand = {
  name: string;
  args: string[];
  redirects: Redirect[];
};

export type Pipeline = SimpleCommand[];

export type CommandListEntry = {
  pipeline: Pipeline;
  separator: '&&' | '||' | ';' | null;
};

export type CommandLine = {
  entries: CommandListEntry[];
};

// === Filesystem Types ===
export type FileNode = {
  type: 'file';
  name: string;
  content: string;
  readonly: boolean;
  createdAt: number;
  modifiedAt: number;
};

export type DirectoryNode = {
  type: 'directory';
  name: string;
  children: Record<string, FileSystemNode>;
  readonly: boolean;
  createdAt: number;
  modifiedAt: number;
};

export type FileSystemNode = FileNode | DirectoryNode;

// === Executor Types ===
export type ExecContext = {
  stdin: string;
  env: Record<string, string>;
  history: string[];
};

export type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  newCwd?: string;
  clear?: boolean;
  newEnv?: Record<string, string>;
};

// === Terminal UI Types ===
export type TerminalLine = {
  id: string;
  command?: string;
  output: string;
  isError?: boolean;
  cwd?: string;
};

// === CLI Data (from server) ===
export type CliData = {
  blogPosts: Array<{slug: string; title: string; excerpt: string; categories: string[]}>;
  projects: Array<{slug: string; title: string}>;
  resumeText: string;
};

// === localStorage persistence ===
export type UserFSEntry = {type: 'file'; content: string} | {type: 'directory'};

export type UserFSData = {
  version: 1;
  entries: Record<string, UserFSEntry>;
};
