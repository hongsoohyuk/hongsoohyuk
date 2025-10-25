import {EmptyState, ProfileCard} from '@/app/instagram/_components';
import {getInstagramMediaServer, getInstagramProfileServer} from '@/lib/api/instagram';
import {InstagramMedia} from '@/lib/types/instagram';
import {Metadata} from 'next';
import InstagramFeed from './sections/InstagramFeed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Instagram Feed | Portfolio',
  description: 'View my Instagram posts and updates',
};

export default async function InstagramPage() {
  const [mediaResponse, profile] = await Promise.all([
    getInstagramMediaServer({limit: 12}),
    getInstagramProfileServer(),
  ]);

  const posts: InstagramMedia[] = mediaResponse.data ?? [];
  const after = mediaResponse.paging?.cursors?.after;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {profile && (
          <ProfileCard
            profilePictureUrl={profile.profile_picture_url ?? ''}
            username={profile.username ?? 'User'}
            biography={profile.biography}
            mediaCount={profile.media_count}
            followersCount={profile.followers_count}
            followsCount={profile.follows_count}
          />
        )}

        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <InstagramFeed initialItems={posts} initialAfter={after} pageSize={12} />
        )}
      </div>
    </div>
  );
}
