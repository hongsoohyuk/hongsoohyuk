import Image from 'next/image';
import {InstagramMedia} from '@/entities/instagram';
import {AspectRatio} from '@/shared/ui/aspect-ratio';

interface PostMediaViewerProps {
  post: InstagramMedia;
}

export function PostMediaViewer({post}: PostMediaViewerProps) {
  const isVideo = post.media_type === 'VIDEO';
  const mediaAlt = post.caption || `Instagram post by ${post.username ?? 'user'}`;
  const thumbnail = post.thumbnail_url || post.media_url;

  return (
    <AspectRatio ratio={4 / 5} className="relative w-full bg-muted">
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
    </AspectRatio>
  );
}
