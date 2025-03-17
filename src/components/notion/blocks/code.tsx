import {richTextToPlain} from '../utils/rich-text-utils';

import type {BlockProps, NarrowBlock} from './types';

export function CodeBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'code'>;
  const codeText = richTextToPlain(b.code.rich_text);
  const language = b.code.language ? String(b.code.language) : '';

  return (
    <div className="space-y-2">
      {language ? <div className="text-xs text-muted-foreground">{language}</div> : null}
      <pre className="overflow-x-auto rounded-md bg-muted border border-border p-4 text-sm">
        <code>{codeText}</code>
      </pre>
      {renderChildren(block)}
    </div>
  );
}
