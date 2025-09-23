import {InstagramProfile} from '@/lib/types';
import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(null, {status: 200});
  }

  const url = new URL(`${process.env.INSTAGRAM_GRAPH_URL}/me`);
  const fields = [
    'id',
    'username',
    'website',
    'biography',
    'followers_count',
    'follows_count',
    'media_count',
    'profile_picture_url',
    'name',
  ];
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('access_token', accessToken);

  try {
    const res = await fetch(url.toString(), {next: {revalidate: 300}});
    if (!res.ok) {
      return NextResponse.json(null, {status: 200});
    }
    const json = (await res.json()) as InstagramProfile;

    const profile: InstagramProfile = {
      id: json.id,
      username: json.username,
      media_count: json.media_count,
      profile_picture_url: json.profile_picture_url,
      name: json.name,
      website: json.website,
      biography: json.biography,
      followers_count: json.followers_count,
      follows_count: json.follows_count,
    };

    return NextResponse.json(profile, {status: 200});
  } catch {
    return NextResponse.json(null, {status: 200});
  }
}
