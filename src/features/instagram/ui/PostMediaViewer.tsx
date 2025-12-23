import Image from 'next/image';
import {InstagramMedia} from '@/entities/instagram';
import clsx from 'clsx';

interface PostMediaViewerProps {
  post: InstagramMedia;
  className?: string;
}

export function PostMediaViewer({post, className}: PostMediaViewerProps) {
  const isVideo = post.media_type === 'VIDEO';
  const mediaAlt = post.caption || `Instagram post by ${post.username ?? 'user'}`;
  const thumbnail = post.thumbnail_url || post.media_url;

  return (
    <figure
      className={clsx(
        'relative aspect-[4/5] w-full max-h-[80vh] overflow-hidden rounded-2xl bg-black sm:aspect-square',
        className,
      )}
    >
      {isVideo ? (
        <video
          controls
          playsInline
          loop
          autoPlay
          muted
          poster={thumbnail}
          className="h-full w-full object-contain"
          preload="metadata"
        >
          <source src={post.media_url} />
          {mediaAlt}
        </video>
      ) : (
        <Image
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 600px"
          src={post.media_url}
          alt={mediaAlt}
          className="object-cover"
        />
      )}
    </figure>
  );
}
