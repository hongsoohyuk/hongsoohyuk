export type FileNode = {
  type: 'file';
  name: string;
  content: string;
};

export type DirectoryNode = {
  type: 'directory';
  name: string;
  children: Record<string, FileSystemNode>;
};

export type FileSystemNode = FileNode | DirectoryNode;

export type TerminalLine = {
  id: string;
  command?: string;
  output: string;
  isError?: boolean;
};

export type CliData = {
  blogPosts: Array<{slug: string; title: string; excerpt: string; categories: string[]}>;
  projects: Array<{slug: string; title: string}>;
  resumeText: string;
};
