import {NotionRichText} from '../notion-rich-text';

import {BlockShell} from './block-shell';
import type {BlockProps, NarrowBlock} from './types';

export function ParagraphBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'paragraph'>;

  return (
    <BlockShell block={block} renderChildren={renderChildren}>
      <p className="leading-7 text-foreground">
        <NotionRichText richText={b.paragraph.rich_text} />
      </p>
    </BlockShell>
  );
}
