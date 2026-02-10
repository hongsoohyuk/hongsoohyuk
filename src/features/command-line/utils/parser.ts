import type {CommandLine, CommandListEntry, Pipeline, Redirect, SimpleCommand, Token} from '../types';

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): CommandLine {
    const entries: CommandListEntry[] = [];

    while (!this.isAtEnd()) {
      const pipeline = this.parsePipeline();
      if (pipeline.length === 0) break;

      let separator: '&&' | '||' | ';' | null = null;
      const tok = this.current();

      if (tok.type === 'AND') {
        separator = '&&';
        this.advance();
      } else if (tok.type === 'OR') {
        separator = '||';
        this.advance();
      } else if (tok.type === 'SEMICOLON') {
        separator = ';';
        this.advance();
      }

      entries.push({pipeline, separator});
    }

    return {entries};
  }

  private parsePipeline(): Pipeline {
    const commands: SimpleCommand[] = [];

    const cmd = this.parseSimpleCommand();
    if (!cmd) return commands;
    commands.push(cmd);

    while (this.current().type === 'PIPE') {
      this.advance(); // skip |
      const next = this.parseSimpleCommand();
      if (next) commands.push(next);
    }

    return commands;
  }

  private parseSimpleCommand(): SimpleCommand | null {
    const words: string[] = [];
    const redirects: Redirect[] = [];

    while (!this.isAtEnd()) {
      const tok = this.current();

      if (tok.type === 'WORD') {
        words.push(tok.value);
        this.advance();
      } else if (tok.type === 'REDIRECT_OUT' || tok.type === 'REDIRECT_APPEND') {
        const type = tok.type === 'REDIRECT_OUT' ? '>' : '>>';
        this.advance();
        const target = this.current();
        if (target.type === 'WORD') {
          redirects.push({type, target: target.value});
          this.advance();
        }
      } else {
        break; // operator token - stop
      }
    }

    if (words.length === 0) return null;

    return {
      name: words[0],
      args: words.slice(1),
      redirects,
    };
  }

  private current(): Token {
    return this.tokens[this.pos] ?? {type: 'EOF' as const, value: ''};
  }

  private advance(): void {
    if (this.pos < this.tokens.length) this.pos++;
  }

  private isAtEnd(): boolean {
    return this.current().type === 'EOF';
  }
}

export function parse(tokens: Token[]): CommandLine {
  return new Parser(tokens).parse();
}
