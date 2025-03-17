import {NotionRichText} from '../notion-rich-text';

import type {BlockProps, NarrowBlock} from './types';

export function CalloutBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'callout'>;
  const calloutIcon = b.callout.icon;
  const icon = calloutIcon && calloutIcon.type === 'emoji' ? calloutIcon.emoji : '';

  return (
    <div className="rounded-md border bg-muted/70 p-4">
      <div className="flex gap-3 items-baseline">
        {icon ? <div className="text-lg leading-none shrink-0">{icon}</div> : null}
        <div className="min-w-0 space-y-2">
          <NotionRichText richText={b.callout.rich_text} />
          {renderChildren(block)}
        </div>
      </div>
    </div>
  );
}
