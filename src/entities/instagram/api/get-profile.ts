import {http, httpServer} from '@/shared/api/http';
import {InstagramProfile} from '../model/types';

/**
 * Client-side: Fetch Instagram profile information
 */

export async function getInstagramProfile(): Promise<InstagramProfile> {
  const data = await http.get<InstagramProfile>('/api/instagram/me');
  return data;
}

/**
 * Server-side: Fetch Instagram profile information
 */
export async function getInitialInstagramProfile(): Promise<InstagramProfile> {
  const data = await httpServer.get<InstagramProfile>('/api/instagram/me');
  return data;
}
