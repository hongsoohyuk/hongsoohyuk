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
    <div className="flex gap-4 text-sm" role="list">
      {stats.map(({label, value}) => (
        <span key={label} role="listitem">
          {value != null ? (
            <strong>
              {value.toLocaleString()} {label}
            </strong>
          ) : (
            <Skeleton className="w-20 h-4" />
          )}
        </span>
      ))}
    </div>
  );
}
