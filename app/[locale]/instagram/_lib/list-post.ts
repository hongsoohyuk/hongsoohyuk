import {readInstagramStaticJson} from './local';
import {InstagramListResponse} from './types';

export async function getInstagramPostList(): Promise<InstagramListResponse> {
  return await readInstagramStaticJson<InstagramListResponse>('feed.json');
}
