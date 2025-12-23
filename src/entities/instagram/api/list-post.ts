import {http, httpServer} from '@/shared/api/http';
import {DEFAULT_LIMIT} from '../config/constant';
import {InstagramListResponse} from '../model/types';

interface Param {
  after?: string;
  limit?: number;
}

/**
 * Client-side: Fetch Instagram media posts
 */
export async function fetchInstagramPostList(params: Param) {
  const {after, limit = DEFAULT_LIMIT} = params;
  const data = await http.get<InstagramListResponse>('/api/instagram/posts', {query: {after, limit}});
  return data;
}

/**
 * Server-side: Fetch Instagram media posts
 */
export async function getInitialInstagramPostList(params: Param) {
  const {after, limit = DEFAULT_LIMIT} = params;
  const data = await httpServer.get<InstagramListResponse>('/api/instagram/posts', {query: {after, limit}});
  return data;
}
