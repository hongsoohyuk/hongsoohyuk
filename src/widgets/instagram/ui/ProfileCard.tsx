import {Card, CardContent} from '@/shared/ui/card';
import Image from 'next/image';
import {InstagramProfile} from '@/entities/instagram';
import {ProfileStats} from '@/features/instagram/ui/ProfileStats';

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
          className="rounded-full"
          priority
        />
        <div className="space-y-2">
          <h1 className="text-md font">{profile.username}</h1>
          {profile.biography && <p className="text-muted-foreground">{profile.biography}</p>}
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
