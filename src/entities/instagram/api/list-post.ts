import { DEFAULT_LIMIT, MEDIA_FIELDS } from '../config/constant';
import {InstagramListResponse} from '../model/types';
import {readInstagramStaticJson} from './local';

export async function getInstagramPostList(): Promise<InstagramListResponse> {
  return await readInstagramStaticJson<InstagramListResponse>('feed.json');
}

export async function getInstagramOriginPostList(): Promise<InstagramListResponse> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) throw new Error('No access token');
  const params = new URLSearchParams([
    ['access_token', accessToken],
    ['limit', String(DEFAULT_LIMIT)],
    ['fields', MEDIA_FIELDS.join(',')],
  ]);

  const response = await fetch(`${process.env.INSTAGRAM_GRAPH_URL}/me/media?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch Instagram posts');

  return await response.json();
}
