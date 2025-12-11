import {GlassCard} from '@/shared/ui/glass-card';
import Image from 'next/image';
import {ProfileStats} from './ProfileStats';

interface ProfileCardProps {
  profilePictureUrl: string;
  username: string;
  biography?: string;
  mediaCount?: number;
  followersCount?: number;
  followsCount?: number;
}

export function ProfileCard({
  profilePictureUrl,
  username,
  biography,
  mediaCount,
  followersCount,
  followsCount,
}: ProfileCardProps) {
  return (
    <GlassCard paddingClassName="p-5 sm:p-6" className="mb-8">
      <div className="flex items-center gap-6">
        <Image
          src={profilePictureUrl}
          alt={`${username}'s profile picture`}
          width={96}
          height={96}
          className="rounded-full"
          priority
        />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{username}</h1>
          {biography && <p className="text-muted-foreground">{biography}</p>}
          <ProfileStats postsCount={mediaCount} followersCount={followersCount} followingCount={followsCount} />
        </div>
      </div>
    </GlassCard>
  );
}
