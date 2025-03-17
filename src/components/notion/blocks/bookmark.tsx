import {extractCaption} from '../utils/rich-text-utils';

import type {BlockProps, NarrowBlock} from './types';

export function BookmarkBlock({block}: BlockProps) {
  const b = block as NarrowBlock<'bookmark'>;
  const url = b.bookmark.url ?? '';
  const caption = extractCaption(b.bookmark.caption);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-md border p-3 text-sm text-primary underline underline-offset-4 hover:bg-muted/40 transition-colors"
    >
      {caption || url}
    </a>
  );
}

export function LinkPreviewBlock({block}: BlockProps) {
  const b = block as NarrowBlock<'link_preview'>;
  const url = b.link_preview.url ?? '';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-md border p-3 text-sm text-primary underline underline-offset-4 hover:bg-muted/40 transition-colors"
    >
      {url}
    </a>
  );
}
