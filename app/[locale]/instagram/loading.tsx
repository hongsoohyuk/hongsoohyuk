import React from 'react';

import {ProfileStatsSkeleton} from './_components/profile-stats';

import {AspectRatio} from '@/components/ui/aspect-ratio';
import {Card, CardContent} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';

export default function InstagramLoading() {
  return (
    <React.Fragment>
      <Card>
        <CardContent className="flex items-center gap-4">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="space-y-2 min-w-0 flex-1">
            <Skeleton className="w-24 h-5" />
            <ProfileStatsSkeleton />
          </div>
        </CardContent>
      </Card>
      <section className={'grid gap-0.5 grid-cols-3 lg:grid-cols-4 '} role="feed">
        {Array.from({length: 16}).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key -- 정적 길이의 스켈레톤은 데이터 키가 없음
          <AspectRatio key={`instagram-loading-skeleton-${index}`} ratio={4 / 5} className="relative w-full bg-muted">
            <Skeleton className="absolute inset-0 rounded-none" />
          </AspectRatio>
        ))}
      </section>
    </React.Fragment>
  );
}
