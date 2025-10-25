import {InstagramMedia} from '@/lib/types/instagram';
import Image from 'next/image';
import {memo} from 'react';
import {PostOverlay} from './PostOverlay';

interface PostItemProps {
  post: InstagramMedia;
  aspectRatioClass?: string;
}

export const PostItem = memo(function PostItem({post, aspectRatioClass = 'aspect-[4/5]'}: PostItemProps) {
  const imageSrc = post.media_type === 'VIDEO' ? post.thumbnail_url! : post.media_url;
  const imageAlt = post.caption || `Instagram post by ${post.username || 'user'}`;

  return (
    <article className="group relative cursor-pointer overflow-hidden" aria-label={imageAlt}>
      <div className={`${aspectRatioClass} bg-muted relative w-full`}>
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
    </article>
  );
});
