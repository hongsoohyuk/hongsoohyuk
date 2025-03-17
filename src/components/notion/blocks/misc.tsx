import type {NotionBlockWithChildren} from '@/types/notion';

import {richTextToPlain} from '../utils/rich-text-utils';

import type {BlockProps, NarrowBlock} from './types';

export function DividerBlock() {
  return <hr className="my-6 border-border" />;
}

export function ChildPageBlock({block}: BlockProps) {
  const b = block as NarrowBlock<'child_page'>;
  const title = b.child_page.title ?? 'Untitled';
  return <div className="text-sm text-muted-foreground">📄 {title}</div>;
}

export function TableOfContentsBlock({allBlocks}: BlockProps) {
  const headings = collectHeadings(allBlocks ?? []);
  if (headings.length === 0) return null;
  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="rounded-md border border-border/50 bg-muted/30 p-4">
      <ul className="space-y-1.5 text-sm">
        {headings.map((h) => (
          <li key={h.id} style={{paddingLeft: `${(h.level - minLevel) * 16}px`}}>
            <a href={`#${h.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function collectHeadings(blocks: NotionBlockWithChildren[]): {id: string; text: string; level: number}[] {
  const headings: {id: string; text: string; level: number}[] = [];
  for (const b of blocks) {
    if (b.type === 'heading_1') headings.push({id: b.id, text: richTextToPlain((b as NarrowBlock<'heading_1'>).heading_1.rich_text), level: 1});
    else if (b.type === 'heading_2') headings.push({id: b.id, text: richTextToPlain((b as NarrowBlock<'heading_2'>).heading_2.rich_text), level: 2});
    else if (b.type === 'heading_3') headings.push({id: b.id, text: richTextToPlain((b as NarrowBlock<'heading_3'>).heading_3.rich_text), level: 3});
  }
  return headings;
}

export function TableRowBlock() {
  return null;
}
