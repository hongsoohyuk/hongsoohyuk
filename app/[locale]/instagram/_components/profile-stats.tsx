import React from 'react';

import {Skeleton} from '@/components/ui/skeleton';
import {StatTile} from '@/components/ui/stat-tile';

interface ProfileStatsProps {
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

function StatRow({stats}: {stats: {label: string; value: React.ReactNode}[]}) {
  return (
    <div className="flex gap-4 text-sm text-muted-foreground" role="list">
      {stats.map(({label, value}) => (
        <StatTile key={label} variant="plain" role="listitem">
          {value}
          <span className="text-xs md:text-sm">{label}</span>
        </StatTile>
      ))}
    </div>
  );
}

export function ProfileStats({postsCount, followersCount, followingCount}: ProfileStatsProps) {
  const stats = [
    {label: 'posts', value: postsCount},
    {label: 'followers', value: followersCount},
    {label: 'following', value: followingCount},
  ].map(({label, value}) => ({
    label,
    value: <strong className="font-semibold text-foreground">{value?.toLocaleString()}</strong>,
  }));

  return <StatRow stats={stats} />;
}

export function ProfileStatsSkeleton() {
  const stats = ['posts', 'followers', 'following'].map((label) => ({
    label,
    value: <Skeleton className="w-8 h-5 md:w-6 md:h-4" />,
  }));

  return <StatRow stats={stats} />;
}
