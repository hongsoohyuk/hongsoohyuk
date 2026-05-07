import {extractCaption} from '../utils/rich-text-utils';

import type {BlockProps, NarrowBlock} from './types';

export function ImageBlock({block, renderChildren}: BlockProps) {
  const b = block as NarrowBlock<'image'>;
  const image = b.image;
  const src = image.type === 'external' ? image.external.url : image.file.url;
  const caption = extractCaption(image.caption);

  if (!src) return null;

  return (
    <figure className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- Notion 원격 이미지는 width/height가 사전에 알려지지 않아 next/image의 정적 최적화가 어려움 */}
      <img src={src} alt={caption || 'Notion image'} className="max-w-full rounded-md border" loading="lazy" />
      {caption ? <figcaption className="text-sm text-muted-foreground">{caption}</figcaption> : null}
      {renderChildren(block)}
    </figure>
  );
}
