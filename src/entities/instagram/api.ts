import {http, httpServer} from '@/shared/api/http';
import {InstagramListResponse, InstagramProfile} from './types';

interface GetMediaParams {
  after?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 12;

/**
 * Client-side: Fetch Instagram media posts
 */
export async function getInstagramMedia(params: GetMediaParams = {}) {
  const {after, limit = DEFAULT_LIMIT} = params;
  const data = await http.get<InstagramListResponse>('/api/instagram/posts', {
    query: {after, limit},
  });
  return data;
}

/**
 * Client-side: Fetch Instagram profile information
 */
export async function getInstagramProfile(): Promise<InstagramProfile | null> {
  const data = await http.get<InstagramProfile | null>('/api/instagram/me');
  return data;
}

/**
 * Server-side: Fetch Instagram media posts
 */
export async function getInstagramMediaServer(params: GetMediaParams = {}) {
  const {after, limit = DEFAULT_LIMIT} = params;
  const data = await httpServer.get<InstagramListResponse>('/api/instagram/posts', {
    query: {after, limit},
    cache: 'no-store',
  });
  return data;
}

/**
 * Server-side: Fetch Instagram profile information
 */
export async function getInstagramProfileServer(): Promise<InstagramProfile | null> {
  const data = await httpServer.get<InstagramProfile | null>('/api/instagram/me', {
    cache: 'no-store',
  });
  return data;
}
