import {InstagramListResponse} from '@/features/instagram/types';
import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const after = searchParams.get('after') || undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 12, 1), 50) : 12;

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json<InstagramListResponse>({data: []}, {status: 200});
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

  const url = new URL(`${process.env.INSTAGRAM_GRAPH_URL}/me/media`);
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('limit', String(limit));
  if (after) url.searchParams.set('after', after);

  try {
    const res = await fetch(url.toString(), {cache: 'no-store'});
    if (!res.ok) {
      return NextResponse.json<InstagramListResponse>({data: []}, {status: 200});
    }
    const json = (await res.json()) as InstagramListResponse;
    return NextResponse.json<InstagramListResponse>(json, {status: 200});
  } catch {
    return NextResponse.json<InstagramListResponse>({data: []}, {status: 200});
  }
}
