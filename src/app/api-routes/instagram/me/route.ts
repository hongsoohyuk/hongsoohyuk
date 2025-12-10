import {InstagramProfile} from '@/entities/instagram';
import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

type CacheEntry = {
  data: InstagramProfile | null;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes
const parsedTtl = Number(process.env.INSTAGRAM_CACHE_TTL_MS);
const CACHE_TTL_MS = Number.isFinite(parsedTtl) && parsedTtl >= 0 ? parsedTtl : DEFAULT_TTL_MS;

let cachedProfile: CacheEntry | null = null;

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, max-age=0, must-revalidate',
};

function readCache(): InstagramProfile | null | undefined {
  if (CACHE_TTL_MS <= 0 || !cachedProfile) return undefined;
  if (cachedProfile.expiresAt <= Date.now()) {
    cachedProfile = null;
    return undefined;
  }
  return cachedProfile.data;
}

function writeCache(data: InstagramProfile | null) {
  if (CACHE_TTL_MS <= 0) return;
  cachedProfile = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(null, {status: 200, headers: RESPONSE_HEADERS});
  }

  const cached = readCache();
  if (cached !== undefined) {
    return NextResponse.json(cached, {status: 200, headers: RESPONSE_HEADERS});
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
    const res = await fetch(url.toString(), {cache: 'no-store'});
    if (!res.ok) {
      return NextResponse.json(null, {status: 200, headers: RESPONSE_HEADERS});
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

    writeCache(profile);

    return NextResponse.json(profile, {status: 200, headers: RESPONSE_HEADERS});
  } catch {
    return NextResponse.json(null, {status: 200, headers: RESPONSE_HEADERS});
  }
}
