'use client';

import {InstagramMedia} from '@/lib/types/instagram';
import Image from 'next/image';
import {memo, useCallback} from 'react';
import {PostOverlay} from './PostOverlay';

interface PostItemProps {
  post: InstagramMedia;
  aspectRatioClass?: string;
  onSelect?: (post: InstagramMedia) => void;
}

export const PostItem = memo(function PostItem({post, aspectRatioClass = 'aspect-[4/5]', onSelect}: PostItemProps) {
  const imageSrc = post.media_type === 'VIDEO' ? (post.thumbnail_url ?? post.media_url) : post.media_url;
  const imageAlt = post.caption || `Instagram post by ${post.username || 'user'}`;
  const handleSelect = useCallback(() => {
    onSelect?.(post);
  }, [onSelect, post]);

  return (
    <article aria-label={imageAlt}>
      <button
        type="button"
        onClick={handleSelect}
        className="group relative block w-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className={`${aspectRatioClass} relative w-full bg-muted`}>
          <Image
            fill
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <PostOverlay likeCount={post.like_count} commentsCount={post.comments_count} />
        </div>
      </button>
    </article>
  );
});
