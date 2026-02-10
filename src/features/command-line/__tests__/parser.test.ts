import {tokenize} from '../utils/lexer';
import {parse} from '../utils/parser';

/** Helper: tokenize then parse */
function parseCmd(input: string) {
  return parse(tokenize(input));
}

describe('Parser', () => {
  describe('simple commands', () => {
    it('parses a single command', () => {
      const ast = parseCmd('ls');
      expect(ast.entries).toHaveLength(1);
      expect(ast.entries[0].pipeline).toHaveLength(1);
      expect(ast.entries[0].pipeline[0]).toEqual({
        name: 'ls',
        args: [],
        redirects: [],
      });
      expect(ast.entries[0].separator).toBeNull();
    });

    it('parses command with arguments', () => {
      const ast = parseCmd('grep -i pattern file.txt');
      const cmd = ast.entries[0].pipeline[0];
      expect(cmd.name).toBe('grep');
      expect(cmd.args).toEqual(['-i', 'pattern', 'file.txt']);
    });
  });

  describe('pipelines', () => {
    it('parses a two-stage pipeline', () => {
      const ast = parseCmd('cat file.txt | grep hello');
      expect(ast.entries).toHaveLength(1);
      const pipeline = ast.entries[0].pipeline;
      expect(pipeline).toHaveLength(2);
      expect(pipeline[0].name).toBe('cat');
      expect(pipeline[0].args).toEqual(['file.txt']);
      expect(pipeline[1].name).toBe('grep');
      expect(pipeline[1].args).toEqual(['hello']);
    });

    it('parses a three-stage pipeline', () => {
      const ast = parseCmd('cat file | grep hello | wc -l');
      const pipeline = ast.entries[0].pipeline;
      expect(pipeline).toHaveLength(3);
      expect(pipeline[0].name).toBe('cat');
      expect(pipeline[1].name).toBe('grep');
      expect(pipeline[2].name).toBe('wc');
      expect(pipeline[2].args).toEqual(['-l']);
    });
  });

  describe('redirects', () => {
    it('parses output redirect', () => {
      const ast = parseCmd('echo hello > output.txt');
      const cmd = ast.entries[0].pipeline[0];
      expect(cmd.name).toBe('echo');
      expect(cmd.args).toEqual(['hello']);
      expect(cmd.redirects).toEqual([{type: '>', target: 'output.txt'}]);
    });

    it('parses append redirect', () => {
      const ast = parseCmd('echo world >> output.txt');
      const cmd = ast.entries[0].pipeline[0];
      expect(cmd.redirects).toEqual([{type: '>>', target: 'output.txt'}]);
    });
  });

  describe('command lists', () => {
    it('parses AND list (&&)', () => {
      const ast = parseCmd('mkdir dir && cd dir');
      expect(ast.entries).toHaveLength(2);
      expect(ast.entries[0].pipeline[0].name).toBe('mkdir');
      expect(ast.entries[0].separator).toBe('&&');
      expect(ast.entries[1].pipeline[0].name).toBe('cd');
      expect(ast.entries[1].separator).toBeNull();
    });

    it('parses OR list (||)', () => {
      const ast = parseCmd('cat missing || echo fallback');
      expect(ast.entries).toHaveLength(2);
      expect(ast.entries[0].separator).toBe('||');
      expect(ast.entries[1].pipeline[0].name).toBe('echo');
    });

    it('parses semicolon list', () => {
      const ast = parseCmd('echo a ; echo b ; echo c');
      expect(ast.entries).toHaveLength(3);
      expect(ast.entries[0].separator).toBe(';');
      expect(ast.entries[1].separator).toBe(';');
      expect(ast.entries[2].separator).toBeNull();
    });

    it('parses mixed operators', () => {
      const ast = parseCmd('cmd1 && cmd2 || cmd3 ; cmd4');
      expect(ast.entries).toHaveLength(4);
      expect(ast.entries[0].separator).toBe('&&');
      expect(ast.entries[1].separator).toBe('||');
      expect(ast.entries[2].separator).toBe(';');
      expect(ast.entries[3].separator).toBeNull();
    });
  });
});
