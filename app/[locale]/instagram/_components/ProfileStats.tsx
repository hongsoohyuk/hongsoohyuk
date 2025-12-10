interface ProfileStatsProps {
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export function ProfileStats({postsCount, followersCount, followingCount}: ProfileStatsProps) {
  const stats = [
    {label: 'posts', value: postsCount ?? 0},
    {label: 'followers', value: followersCount ?? 0},
    {label: 'following', value: followingCount ?? 0},
  ];

  return (
    <div className="flex gap-4 text-sm" role="list">
      {stats.map(({label, value}) => (
        <span key={label} role="listitem">
          <strong>{value.toLocaleString()}</strong> {label}
        </span>
      ))}
    </div>
  );
}
