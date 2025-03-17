import {NotionRichText} from '../notion-rich-text';

import type {BlockProps, NarrowBlock} from './types';

export function HeadingBlock({block, renderChildren}: BlockProps) {
  let richText;
  let level: 1 | 2 | 3;

  if (block.type === 'heading_1') {
    richText = (block as NarrowBlock<'heading_1'>).heading_1.rich_text;
    level = 1;
  } else if (block.type === 'heading_2') {
    richText = (block as NarrowBlock<'heading_2'>).heading_2.rich_text;
    level = 2;
  } else {
    richText = (block as NarrowBlock<'heading_3'>).heading_3.rich_text;
    level = 3;
  }

  const className = {
    1: 'text-3xl font-bold tracking-tight text-wrap-balance scroll-mt-20',
    2: 'text-2xl font-semibold tracking-tight text-wrap-balance scroll-mt-20',
    3: 'text-xl font-semibold tracking-tight text-wrap-balance scroll-mt-20',
  }[level];

  const Tag = `h${level}` as const;

  return (
    <div className="space-y-2">
      <Tag id={block.id} className={className}>
        <NotionRichText richText={richText} />
      </Tag>
      {renderChildren(block)}
    </div>
  );
}
