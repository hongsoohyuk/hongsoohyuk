import type {ReactNode} from 'react';

import type {NotionBlockWithChildren} from '@/types/notion';

type BlockShellProps = {
  block: NotionBlockWithChildren;
  renderChildren: (block: NotionBlockWithChildren) => ReactNode;
  as?: 'div' | 'figure';
  children: ReactNode;
};

/**
 * Shared shell for leaf block renderers: stacks the block body above its
 * rendered children with `space-y-2`. Hoists the wrapper that was previously
 * duplicated across paragraph/quote/code/todo/heading/image/video renderers.
 */
export function BlockShell({block, renderChildren, as = 'div', children}: BlockShellProps) {
  const content = (
    <>
      {children}
      {renderChildren(block)}
    </>
  );

  return as === 'figure' ? (
    <figure className="space-y-2">{content}</figure>
  ) : (
    <div className="space-y-2">{content}</div>
  );
}
