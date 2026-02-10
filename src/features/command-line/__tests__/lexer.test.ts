import {tokenize} from '../utils/lexer';

describe('Lexer (tokenize)', () => {
  describe('basic words', () => {
    it('tokenizes a single command', () => {
      const tokens = tokenize('ls');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'ls'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('tokenizes command with arguments', () => {
      const tokens = tokenize('ls -la /home');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'ls'},
        {type: 'WORD', value: '-la'},
        {type: 'WORD', value: '/home'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('handles extra whitespace', () => {
      const tokens = tokenize('  echo   hello  ');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hello'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('returns only EOF for empty input', () => {
      const tokens = tokenize('');
      expect(tokens).toEqual([{type: 'EOF', value: ''}]);
    });
  });

  describe('operators', () => {
    it('tokenizes pipe', () => {
      const tokens = tokenize('ls | grep foo');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'ls'},
        {type: 'PIPE', value: '|'},
        {type: 'WORD', value: 'grep'},
        {type: 'WORD', value: 'foo'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('tokenizes AND operator', () => {
      const tokens = tokenize('mkdir test && cd test');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'mkdir'},
        {type: 'WORD', value: 'test'},
        {type: 'AND', value: '&&'},
        {type: 'WORD', value: 'cd'},
        {type: 'WORD', value: 'test'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('tokenizes OR operator', () => {
      const tokens = tokenize('cat file.txt || echo not found');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'cat'},
        {type: 'WORD', value: 'file.txt'},
        {type: 'OR', value: '||'},
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'not'},
        {type: 'WORD', value: 'found'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('tokenizes semicolon', () => {
      const tokens = tokenize('echo a ; echo b');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'a'},
        {type: 'SEMICOLON', value: ';'},
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'b'},
        {type: 'EOF', value: ''},
      ]);
    });
  });

  describe('redirects', () => {
    it('tokenizes output redirect >', () => {
      const tokens = tokenize('echo hello > file.txt');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hello'},
        {type: 'REDIRECT_OUT', value: '>'},
        {type: 'WORD', value: 'file.txt'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('tokenizes append redirect >>', () => {
      const tokens = tokenize('echo hello >> file.txt');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hello'},
        {type: 'REDIRECT_APPEND', value: '>>'},
        {type: 'WORD', value: 'file.txt'},
        {type: 'EOF', value: ''},
      ]);
    });
  });

  describe('quoting', () => {
    it('handles double-quoted strings', () => {
      const tokens = tokenize('echo "hello world"');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hello world'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('handles single-quoted strings (no expansion)', () => {
      const tokens = tokenize("echo '$HOME'", {HOME: '/home/user'});
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: '$HOME'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('handles escape sequences in double quotes', () => {
      const tokens = tokenize('echo "say \\"hi\\""');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'say "hi"'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('handles backslash escape outside quotes', () => {
      const tokens = tokenize('echo hello\\ world');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hello world'},
        {type: 'EOF', value: ''},
      ]);
    });
  });

  describe('variable expansion', () => {
    it('expands $VAR', () => {
      const tokens = tokenize('echo $USER', {USER: 'hong'});
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hong'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('expands ${VAR}', () => {
      const tokens = tokenize('echo ${HOME}', {HOME: '~'});
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: '~'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('expands $VAR in double quotes', () => {
      const tokens = tokenize('echo "hello $USER"', {USER: 'hong'});
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hello hong'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('drops empty token for undefined variable', () => {
      const tokens = tokenize('echo $UNDEFINED');
      // Lexer readWord skips pushing empty-value words when tokens already exist
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'EOF', value: ''},
      ]);
    });

    it('expands $? for exit code', () => {
      const tokens = tokenize('echo $?', {'?': '0'});
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: '0'},
        {type: 'EOF', value: ''},
      ]);
    });
  });

  describe('comments', () => {
    it('ignores everything after #', () => {
      const tokens = tokenize('echo hello # this is a comment');
      expect(tokens).toEqual([
        {type: 'WORD', value: 'echo'},
        {type: 'WORD', value: 'hello'},
        {type: 'EOF', value: ''},
      ]);
    });
  });
});
