import {readInstagramStaticJson} from './local';
import {InstagramProfile} from './types';

export async function getInstagramProfile(): Promise<InstagramProfile> {
  return await readInstagramStaticJson<InstagramProfile>('profile.json');
}
