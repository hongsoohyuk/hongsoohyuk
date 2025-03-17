import {NotionRichText} from '../notion-rich-text';

import type {BlockProps, NarrowBlock} from './types';

export function QuoteBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'quote'>;

  return (
    <div className="space-y-2">
      <blockquote className="border-l-2 pl-4 italic text-foreground/70">
        <NotionRichText richText={b.quote.rich_text} />
      </blockquote>
      {renderChildren(block)}
    </div>
  );
}
