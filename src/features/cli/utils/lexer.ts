import type {Token, TokenType} from '../types';

const OPERATOR_CHARS = new Set(['|', '&', '>', ';']);
const WHITESPACE = new Set([' ', '\t']);

class Lexer {
  private input: string;
  private pos = 0;
  private env: Record<string, string>;
  private tokens: Token[] = [];

  constructor(input: string, env: Record<string, string> = {}) {
    this.input = input;
    this.env = env;
  }

  tokenize(): Token[] {
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const ch = this.current();

      if (ch === '|') {
        this.readOperator();
      } else if (ch === '&') {
        this.readOperator();
      } else if (ch === '>') {
        this.readRedirect();
      } else if (ch === ';') {
        this.push('SEMICOLON', ';');
        this.pos++;
      } else if (ch === '#') {
        // comment - skip rest of line
        break;
      } else {
        this.readWord();
      }
    }

    this.push('EOF', '');
    return this.tokens;
  }

  private readOperator(): void {
    const ch = this.current();

    if (ch === '|') {
      if (this.peek(1) === '|') {
        this.push('OR', '||');
        this.pos += 2;
      } else {
        this.push('PIPE', '|');
        this.pos++;
      }
    } else if (ch === '&') {
      if (this.peek(1) === '&') {
        this.push('AND', '&&');
        this.pos += 2;
      } else {
        // single & treated as background (ignore, treat as word end)
        this.pos++;
      }
    }
  }

  private readRedirect(): void {
    if (this.peek(1) === '>') {
      this.push('REDIRECT_APPEND', '>>');
      this.pos += 2;
    } else {
      this.push('REDIRECT_OUT', '>');
      this.pos++;
    }
  }

  private readWord(): void {
    let value = '';

    while (this.pos < this.input.length) {
      const ch = this.current();

      if (WHITESPACE.has(ch) || OPERATOR_CHARS.has(ch)) {
        break;
      }

      if (ch === '\\') {
        // escape next character
        this.pos++;
        if (this.pos < this.input.length) {
          value += this.input[this.pos];
          this.pos++;
        }
      } else if (ch === '"') {
        value += this.readDoubleQuoted();
      } else if (ch === "'") {
        value += this.readSingleQuoted();
      } else if (ch === '$') {
        value += this.expandVariable();
      } else {
        value += ch;
        this.pos++;
      }
    }

    if (value || value === '') {
      // only push if we consumed something
      if (value !== '' || this.tokens.length === 0) {
        this.push('WORD', value);
      }
    }
  }

  /** Double-quoted string: supports \escape and $VAR expansion */
  private readDoubleQuoted(): string {
    this.pos++; // skip opening "
    let value = '';

    while (this.pos < this.input.length && this.input[this.pos] !== '"') {
      const ch = this.input[this.pos];

      if (ch === '\\') {
        this.pos++;
        if (this.pos < this.input.length) {
          const next = this.input[this.pos];
          // only escape special chars in double quotes
          if (next === '"' || next === '\\' || next === '$' || next === '`') {
            value += next;
          } else {
            value += '\\' + next;
          }
          this.pos++;
        }
      } else if (ch === '$') {
        value += this.expandVariable();
      } else {
        value += ch;
        this.pos++;
      }
    }

    if (this.pos < this.input.length) this.pos++; // skip closing "
    return value;
  }

  /** Single-quoted string: no escape, no expansion */
  private readSingleQuoted(): string {
    this.pos++; // skip opening '
    let value = '';

    while (this.pos < this.input.length && this.input[this.pos] !== "'") {
      value += this.input[this.pos];
      this.pos++;
    }

    if (this.pos < this.input.length) this.pos++; // skip closing '
    return value;
  }

  /** Expand $VAR or ${VAR} */
  private expandVariable(): string {
    this.pos++; // skip $

    if (this.pos >= this.input.length) return '$';

    const ch = this.input[this.pos];

    // ${VAR} syntax
    if (ch === '{') {
      this.pos++;
      let varName = '';
      while (this.pos < this.input.length && this.input[this.pos] !== '}') {
        varName += this.input[this.pos];
        this.pos++;
      }
      if (this.pos < this.input.length) this.pos++; // skip }
      return this.env[varName] ?? '';
    }

    // $? = last exit code (handled by env)
    if (ch === '?') {
      this.pos++;
      return this.env['?'] ?? '0';
    }

    // $VAR syntax
    let varName = '';
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      varName += this.input[this.pos];
      this.pos++;
    }

    if (!varName) return '$';
    return this.env[varName] ?? '';
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && WHITESPACE.has(this.input[this.pos])) {
      this.pos++;
    }
  }

  private current(): string {
    return this.input[this.pos];
  }

  private peek(offset: number): string | undefined {
    return this.input[this.pos + offset];
  }

  private push(type: TokenType, value: string): void {
    this.tokens.push({type, value});
  }
}

export function tokenize(input: string, env: Record<string, string> = {}): Token[] {
  return new Lexer(input, env).tokenize();
}
