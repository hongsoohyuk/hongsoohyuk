import {readInstagramStaticJson} from './local';
import {PROFILE_FIELDS} from '../config/constant';
import {InstagramProfile} from '../model/types';

export async function getInstagramProfile(): Promise<InstagramProfile> {
  return await readInstagramStaticJson<InstagramProfile>('profile.json');
}

export async function getInstagramOriginProfile(): Promise<InstagramProfile> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) throw new Error('No access token');
  const params = new URLSearchParams([
    ['access_token', accessToken],
    ['fields', PROFILE_FIELDS.join(',')],
  ]);

  const response = await fetch(`${process.env.INSTAGRAM_GRAPH_URL}/me?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch Instagram profile');

  return await response.json();
}
