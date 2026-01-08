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
    <div className="flex gap-4 text-muted-foreground" role="list">
      {stats.map(({label, value}) => (
        <span key={label} role="listitem">
          {value != null ? (
            <p>
              {value.toLocaleString()} {label}
            </p>
          ) : (
            <Skeleton className="w-20 h-4" />
          )}
        </span>
      ))}
    </div>
  );
}
