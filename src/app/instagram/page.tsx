import {fetchInstagramMediaServer, fetchInstagramProfileServer} from '@/features/instagram/api/server';
import {InstagramMedia} from '@/features/instagram/types';
import {Button, Card, CardContent} from '@/shared/ui';
import Image from 'next/image';
import InstagramFeedClient from './sections/InstagramFeedClient';

export default async function InstagramPage() {
  const initial = await fetchInstagramMediaServer({limit: 3});
  const posts: InstagramMedia[] = initial.data ?? [];
  const after = initial.paging?.cursors?.after;
  const profile = await fetchInstagramProfileServer();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center gap-6">
              <Image
                src={profile?.profile_picture_url ?? ''}
                alt={profile?.username ?? ''}
                width={96}
                height={96}
                className="rounded-full "
              />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{profile?.username ?? 'instagram'}</h3>
                <p className="text-muted-foreground">{profile?.biography ?? ''}</p>
                <div className="flex gap-4 text-sm">
                  <span>
                    <strong>{profile?.media_count}</strong> posts
                  </span>
                  <span>
                    <strong>{profile?.followers_count ?? 0}</strong> followers
                  </span>
                  <span>
                    <strong>{profile?.follows_count ?? 0}</strong> following
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-semibold mb-2">게시물이 없습니다</h3>

              <Button variant="outline">Instagram 방문하기</Button>
            </CardContent>
          </Card>
        ) : (
          <InstagramFeedClient initialItems={posts} initialAfter={after} />
        )}
      </div>
    </div>
  );
}
