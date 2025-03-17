import {cn} from '@/utils/style';

import {NotionRichText} from '../notion-rich-text';

import type {BlockProps, NarrowBlock} from './types';

export function TodoBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'to_do'>;
  const checked = Boolean(b.to_do.checked);

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2">
        <input type="checkbox" checked={checked} readOnly className="mt-1" />
        <span className={cn(checked && 'line-through text-muted-foreground')}>
          <NotionRichText richText={b.to_do.rich_text} />
        </span>
      </label>
      {renderChildren(block)}
    </div>
  );
}
