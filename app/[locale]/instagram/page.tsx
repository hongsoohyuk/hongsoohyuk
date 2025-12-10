import {EmptyState, ProfileCard} from './_components';
import {getInstagramMediaServer, getInstagramProfileServer, InstagramMedia} from '@/entities/instagram';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import InstagramFeed from './sections/InstagramFeed';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Instagram'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function InstagramPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

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
