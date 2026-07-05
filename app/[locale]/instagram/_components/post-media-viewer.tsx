'use client';

import {useState} from 'react';

import Image from 'next/image';
import {ChevronLeft, ChevronRight} from 'lucide-react';

import {AspectRatio} from '@/components/ui/aspect-ratio';
import {Button} from '@/components/ui/button';
import {InstagramMedia, InstagramMediaChild} from '../_lib/types';

interface MediaDisplayProps {
  media: InstagramMedia | InstagramMediaChild;
  alt: string;
}

function MediaDisplay({media, alt}: MediaDisplayProps) {
  // sync된 feed.json에는 저작권 등의 이유로 media_url이 생략된 항목이 있을 수 있음
  if (!media.media_url) {
    return <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">{alt}</div>;
  }

  if (media.media_type === 'VIDEO') {
    const poster = media.thumbnail_url || media.media_url;
    return (
      <video
        key={media.id}
        controls
        playsInline
        loop
        autoPlay
        muted
        poster={poster}
        className="h-full w-full object-contain"
        preload="metadata"
      >
        <source src={media.media_url} />
        {alt}
      </video>
    );
  }

  return (
    <Image
      key={media.id}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 600px"
      src={media.media_url}
      alt={alt}
      className="object-cover"
    />
  );
}

interface PostMediaViewerProps {
  post: InstagramMedia;
}

export function PostMediaViewer({post}: PostMediaViewerProps) {
  const isCarousel = post.media_type === 'CAROUSEL_ALBUM' && post.children && post.children.length > 0;

  if (isCarousel) {
    return <CarouselViewer post={post} items={post.children!} />;
  }

  return <SingleMediaViewer post={post} />;
}

function SingleMediaViewer({post}: {post: InstagramMedia}) {
  const mediaAlt = post.caption || `Instagram post by ${post.username ?? 'user'}`;

  return (
    <AspectRatio ratio={4 / 5} className="relative w-full bg-muted">
      <MediaDisplay media={post} alt={mediaAlt} />
    </AspectRatio>
  );
}

interface CarouselViewerProps {
  post: InstagramMedia;
  items: InstagramMediaChild[];
}

function CarouselViewer({post, items}: CarouselViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = items.length;
  const currentItem = items[currentIndex];
  const mediaAlt = post.caption || `Instagram post by ${post.username ?? 'user'}`;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      <AspectRatio ratio={4 / 5} className="relative w-full bg-muted">
        <MediaDisplay media={currentItem} alt={`${mediaAlt} - ${currentIndex + 1}/${totalItems}`} />

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
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-[width,background-color] ${
              index === currentIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
