import Image from 'next/image';

import {ProfileStats} from './ProfileStats';

import {InstagramProfile} from '../types';

import {Card, CardContent} from '@/components/ui/card';

interface ProfileCardProps {
  profile: InstagramProfile;
}

export function ProfileCard({profile}: ProfileCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <Image
          src={profile.profile_picture_url as string}
          alt={`${profile.username}'s profile picture`}
          width={80}
          height={80}
          className="rounded-full shrink-0"
          priority
        />
        <div className="space-y-2 min-w-0 flex-1">
          <h1 className="text-md font-medium">{profile.username}</h1>
          {profile.biography && (
            <p className="text-muted-foreground text-sm line-clamp-2 hidden md:block">{profile.biography}</p>
          )}
          <ProfileStats
            postsCount={profile.media_count}
            followersCount={profile.followers_count}
            followingCount={profile.follows_count}
          />
        </div>
      </CardContent>
    </Card>
  );
}
