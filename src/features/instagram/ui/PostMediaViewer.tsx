'use client';

import {useState, useCallback} from 'react';

import {ChevronLeft, ChevronRight} from 'lucide-react';
import Image from 'next/image';

import {InstagramMedia, InstagramMediaChild} from '@/entities/instagram/model/types';

import {AspectRatio} from '@/shared/ui/aspect-ratio';
import {Button} from '@/shared/ui/button';

interface PostMediaViewerProps {
  post: InstagramMedia;
}

export function PostMediaViewer({post}: PostMediaViewerProps) {
  const isCarousel = post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.length > 0;

  if (isCarousel) {
    return <CarouselViewer post={post} children={post.children!} />;
  }

  return <SingleMediaViewer post={post} />;
}

function SingleMediaViewer({post}: {post: InstagramMedia}) {
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

interface CarouselViewerProps {
  post: InstagramMedia;
  children: InstagramMediaChild[];
}

function CarouselViewer({post, children}: CarouselViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = children.length;
  const currentItem = children[currentIndex];
  const mediaAlt = post.caption || `Instagram post by ${post.username ?? 'user'}`;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  }, [totalItems]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  }, [totalItems]);

  const isVideo = currentItem.media_type === 'VIDEO';
  const thumbnail = currentItem.thumbnail_url || currentItem.media_url;

  return (
    <div className="relative">
      <AspectRatio ratio={4 / 5} className="relative w-full bg-muted">
        {isVideo ? (
          <video
            key={currentItem.id}
            controls
            playsInline
            loop
            autoPlay
            muted
            poster={thumbnail}
            className="h-full w-full object-contain"
            preload="metadata"
          >
            <source src={currentItem.media_url} />
            {mediaAlt}
          </video>
        ) : (
          <Image
            key={currentItem.id}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 600px"
            src={currentItem.media_url}
            alt={`${mediaAlt} - ${currentIndex + 1}/${totalItems}`}
            className="object-cover"
          />
        )}

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
          onClick={goToNext}
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </AspectRatio>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-1.5 mt-3">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
