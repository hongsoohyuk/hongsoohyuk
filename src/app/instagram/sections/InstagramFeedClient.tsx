'use client';

import {Skeleton} from '@/component/ui/skeleton';
import {IG_FEED_STYLES} from '@/lib/constants/instagram';
import {useInstagramFeed} from '@/lib/hooks/instagram';
import {InstagramMedia} from '@/lib/types/instagram';
import Image from 'next/image';
import {memo, useCallback, useEffect, useRef, useState} from 'react';

interface Props {
  initialItems: InstagramMedia[];
  initialAfter?: string;
}

const InstagramImage = memo(function InstagramImage({src, alt}: {src: string; alt: string}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.warn(`Instagram 이미지 로딩 실패: ${src}`);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  if (imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-center text-muted-foreground">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-xs">이미지를 불러올 수 없습니다</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-pulse text-muted-foreground">로딩 중...</div>
        </div>
      )}
      <Image
        fill
        src={src}
        alt={alt}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={false}
        quality={75}
      />
    </>
  );
});

const InstagramPostItem = memo(function InstagramPostItem({post}: {post: InstagramMedia}) {
  const imageSrc = post.media_type === 'VIDEO' ? post.thumbnail_url! : post.media_url;
  const imageAlt = post.caption || 'Instagram post';

  return (
    <div className="group relative cursor-pointer overflow-hidden">
      <div className={`${IG_FEED_STYLES.itemAspectClass} bg-muted relative w-full`}>
        <InstagramImage src={imageSrc} alt={imageAlt} />
        <div className="pointer-events-none absolute inset-0 bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/40 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-4 text-white font-semibold text-sm">
            <span>❤️ {post.like_count ?? 0}</span>
            <span>💬 {post.comments_count ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function InstagramFeedClient({initialItems, initialAfter}: Props) {
  const {items, isLoading, error, hasMore, loadMore} = useInstagramFeed({
    initialItems,
    initialAfter,
    pageSize: 12,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore],
  );

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(onIntersect, {rootMargin: '200px'});
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <>
      <div className={`grid ${IG_FEED_STYLES.gridColsClass}`}>
        {items.map((post) => (
          <InstagramPostItem key={post.id} post={post} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-10" />

      {isLoading && (
        <div className={`grid ${IG_FEED_STYLES.gridColsClass}`}>
          {Array.from({length: 3}).map((_, index) => (
            <Skeleton key={`loading-${index}`} className={`${IG_FEED_STYLES.itemAspectClass}`} />
          ))}
        </div>
      )}
      {error && <div className="text-center py-4 text-sm text-destructive">오류: {error}</div>}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">모든 게시물을 불러왔습니다</div>
      )}
    </>
  );
}
