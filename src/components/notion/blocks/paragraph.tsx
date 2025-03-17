import {NotionRichText} from '../notion-rich-text';

import type {BlockProps, NarrowBlock} from './types';

export function ParagraphBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'paragraph'>;

  return (
    <div className="space-y-2">
      <p className="leading-7 text-foreground">
        <NotionRichText richText={b.paragraph.rich_text} />
      </p>
      {renderChildren(block)}
    </div>
  );
}
