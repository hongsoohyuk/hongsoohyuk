import {Skeleton} from '@/shared/ui/skeleton';

interface ProfileStatsProps {
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export function ProfileStats({postsCount, followersCount, followingCount}: ProfileStatsProps) {
  const stats = [
    {label: 'posts', value: postsCount},
    {label: 'followers', value: followersCount},
    {label: 'following', value: followingCount},
  ];

  return (
    <div className="flex gap-4 text-sm text-muted-foreground" role="list">
      {stats.map(({label, value}) => (
        <div key={label} className="flex flex-col items-start md:flex-row md:gap-1 md:items-center" role="listitem">
          <strong className="font-semibold text-foreground">{value?.toLocaleString()}</strong>
          <span className="text-xs md:text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="flex gap-4 text-sm text-muted-foreground" role="list">
      {['posts', 'followers', 'following'].map((label) => (
        <div key={label} className="flex flex-col items-start md:flex-row md:gap-1 md:items-center">
          <Skeleton className="w-8 h-5 md:w-6 md:h-4" />
          <span className="text-xs md:text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}
