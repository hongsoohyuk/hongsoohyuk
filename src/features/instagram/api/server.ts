import 'server-only';

import {InstagramListResponse, InstagramProfile} from '../types';

interface FetchParams {
  after?: string;
  limit?: number;
}

export async function fetchInstagramMediaServer(params: FetchParams = {}): Promise<InstagramListResponse> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return {data: []};
  }

  const fields = [
    'id',
    'media_type',
    'media_url',
    'thumbnail_url',
    'like_count',
    'comments_count',
    'username',
    'caption',
    'timestamp',
  ];
  const {after, limit = 12} = params;
  const url = new URL(`${process.env.INSTAGRAM_GRAPH_URL}/me/media`);
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('limit', String(limit));
  if (after) url.searchParams.set('after', after);

  const res = await fetch(url.toString(), {next: {revalidate: 60}});
  if (!res.ok) {
    // Swallow errors server-side to avoid hard-crashing the page
    return {data: []};
  }
  const json = (await res.json()) as InstagramListResponse;
  return json;
}

export async function fetchInstagramProfileServer(): Promise<InstagramProfile | null> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) return null;

  const url = new URL(`${process.env.INSTAGRAM_GRAPH_URL}/me`);
  // Basic Display API: fields user_id, username
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

  const res = await fetch(url.toString(), {next: {revalidate: 300}});
  if (!res.ok) return null;
  const json = (await res.json()) as InstagramProfile;
  return {
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
}
