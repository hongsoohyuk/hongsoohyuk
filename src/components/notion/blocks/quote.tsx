import {NotionRichText} from '../notion-rich-text';

import {BlockShell} from './block-shell';
import type {BlockProps, NarrowBlock} from './types';

export function QuoteBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'quote'>;

  return (
    <BlockShell block={block} renderChildren={renderChildren}>
      <blockquote className="border-l-2 pl-4 italic text-foreground/70">
        <NotionRichText richText={b.quote.rich_text} />
      </blockquote>
    </BlockShell>
  );
}
