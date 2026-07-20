import {BlockShell} from './block-shell';
import {richTextToPlain} from '../utils/rich-text-utils';

import type {BlockProps, NarrowBlock} from './types';

export function CodeBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'code'>;
  const codeText = richTextToPlain(b.code.rich_text);
  const language = b.code.language ? String(b.code.language) : '';

  return (
    <BlockShell block={block} renderChildren={renderChildren}>
      {language ? <div className="text-xs text-muted-foreground">{language}</div> : null}
      <pre className="overflow-x-auto rounded-md bg-muted border border-border p-4 text-sm">
        <code>{codeText}</code>
      </pre>
    </BlockShell>
  );
}
