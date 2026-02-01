import {Layers} from 'lucide-react';
import Image from 'next/image';

import {useFormatter} from 'next-intl';

import {InstagramMedia} from '@/entities/instagram';

import {AspectRatio} from '@/shared/ui/aspect-ratio';
import {Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger} from '@/shared/ui/dialog';

import {FeedStats} from './FeedStats';
import {PostComments} from './PostComments';
import {PostMediaViewer} from './PostMediaViewer';

interface Props {
  post: InstagramMedia;
}

export function FeedItem({post}: Props) {
  const format = useFormatter();

  const imageSrc = post.media_type === 'VIDEO' ? (post.thumbnail_url ?? post.media_url) : post.media_url;
  const imageAlt = post.caption || `Instagram post by ${post.username || 'user'}`;
  const isCarousel = post.media_type === 'CAROUSEL_ALBUM';

  return (
    <Dialog>
      <DialogTrigger
        asChild
        className="group relative block w-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <AspectRatio ratio={4 / 5} className="relative w-full bg-muted">
          <Image
            fill
            src={imageSrc}
            alt={imageAlt}
            loading="eager"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isCarousel && (
            <div className="absolute top-2 right-2 text-white drop-shadow-md" aria-label="Carousel post">
              <Layers className="h-5 w-5" />
            </div>
          )}
          <FeedOverlay likeCount={post.like_count} commentsCount={post.comments_count} />
        </AspectRatio>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-sm md:text-md">
          {post.timestamp
            ? format.dateTime(new Date(post.timestamp), {dateStyle: 'medium', timeStyle: 'short'})
            : 'Unknown timestamp'}
        </DialogTitle>
        <PostMediaViewer post={post} />
        <FeedStats likeCount={post.like_count} commentsCount={post.comments_count} />
        <PostComments comments={post.comments} caption={post.caption} username={post.username} />
      </DialogContent>
    </Dialog>
  );
}

function FeedOverlay({likeCount = 0, commentsCount = 0}: {likeCount?: number; commentsCount?: number}) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/40 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex items-center gap-4 text-white font-semibold text-sm" role="group">
          <span aria-label={`${likeCount} likes`}>❤️ {likeCount.toLocaleString()}</span>
          <span aria-label={`${commentsCount} comments`}>💬 {commentsCount.toLocaleString()}</span>
        </div>
      </div>
    </>
  );
}
