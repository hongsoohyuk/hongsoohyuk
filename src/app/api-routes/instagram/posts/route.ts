import {InstagramListResponse} from '@/entities/instagram';
import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

type CacheEntry = {
  data: InstagramListResponse;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes
const parsedTtl = Number(process.env.INSTAGRAM_CACHE_TTL_MS);
const CACHE_TTL_MS = Number.isFinite(parsedTtl) && parsedTtl >= 0 ? parsedTtl : DEFAULT_TTL_MS;
const MAX_CACHE_SIZE = 50;

const mediaCache = new Map<string, CacheEntry>();

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, max-age=0, must-revalidate',
};

function buildCacheKey(limit: number, after?: string | null) {
  return `${limit}:${after ?? ''}`;
}

function readCache(key: string): InstagramListResponse | null {
  if (CACHE_TTL_MS <= 0) return null;
  const entry = mediaCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    mediaCache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key: string, data: InstagramListResponse) {
  if (CACHE_TTL_MS <= 0) return;
  if (mediaCache.size >= MAX_CACHE_SIZE) pruneCache();
  mediaCache.set(key, {data, expiresAt: Date.now() + CACHE_TTL_MS});
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of mediaCache) {
    if (entry.expiresAt <= now) {
      mediaCache.delete(key);
    }
  }
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);

  const afterParam = searchParams.get('after');
  const after = afterParam || undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 12, 1), 50) : 12;

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json(null, {status: 401, headers: RESPONSE_HEADERS});

  const cacheKey = buildCacheKey(limit, after);
  const cached = readCache(cacheKey);
  if (cached) {
    return NextResponse.json<InstagramListResponse>(cached, {
      status: 200,
      headers: RESPONSE_HEADERS,
    });
  }

  const fields = [
    'id',
    'media_type',
    'media_url',
    'thumbnail_url',
    'permalink',
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
      return NextResponse.json(null, {status: 500, headers: RESPONSE_HEADERS});
    }

    const json = (await res.json()) as InstagramListResponse;
    writeCache(cacheKey, json);
    return NextResponse.json<InstagramListResponse>(json, {status: 200, headers: RESPONSE_HEADERS});
  } catch {
    return NextResponse.json(null, {status: 500, headers: RESPONSE_HEADERS});
  }
}
