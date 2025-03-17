import {NotionRichText} from '../notion-rich-text';

import type {BlockProps, NarrowBlock} from './types';

export function ToggleBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'toggle'>;

  return (
    <details className="rounded-md border p-3">
      <summary className="cursor-pointer select-none">
        <NotionRichText richText={b.toggle.rich_text} />
      </summary>
      <div className="mt-3">
        {renderChildren(block)}
      </div>
    </details>
  );
}
