import {ProfileStats as ProfileStatsSkeleton} from '@/features/instagram/ui/ProfileStats';
import {AspectRatio} from '@/shared/ui/aspect-ratio';
import {Card, CardContent} from '@/shared/ui/card';
import {Skeleton} from '@/shared/ui/skeleton';
import React from 'react';

export default function InstagramLoading() {
  return (
    <React.Fragment>
      <Card>
        <CardContent className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-6" />
            <ProfileStatsSkeleton />
          </div>
        </CardContent>
      </Card>
      <section className={'grid gap-0.5 grid-cols-3 lg:grid-cols-4 '} role="feed">
        {Array.from({length: 16}).map((_, index) => (
          <AspectRatio key={`instagram-loading-skeleton-${index}`} ratio={4 / 5} className="relative w-full bg-muted">
            <Skeleton className="absolute inset-0 rounded-none" />
          </AspectRatio>
        ))}
      </section>
    </React.Fragment>
  );
}
