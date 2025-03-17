import {extractCaption} from '../utils/rich-text-utils';

import type {BlockProps, NarrowBlock} from './types';

export function VideoBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'video'>;
  const video = b.video;
  const src = video.type === 'external' ? video.external.url : video.file.url;
  const caption = extractCaption(video.caption);

  if (!src) return null;

  return (
    <figure className="space-y-2">
      <video src={src} controls className="max-w-full rounded-md border" preload="metadata">
        Your browser does not support the video tag.
      </video>
      {caption ? <figcaption className="text-sm text-muted-foreground">{caption}</figcaption> : null}
      {renderChildren(block)}
    </figure>
  );
}
