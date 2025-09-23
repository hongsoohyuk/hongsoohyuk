import {http} from '../http';
import {InstagramListResponse, InstagramProfile} from '../types';

// Client-side API functions
export async function getInstagramMedia(params: {after?: string; limit?: number} = {}) {
  const {after, limit = 12} = params;
  const data = await http.get<InstagramListResponse>('/api/instagram/posts', {
    query: {after, limit},
  });
  return data;
}

export async function getInstagramProfile(): Promise<InstagramProfile | null> {
  const data = await http.get<InstagramProfile | null>('/api/instagram/me');
  return data;
}

// Server-side API functions
export async function getInstagramMediaServer(params: {after?: string; limit?: number} = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const {after, limit = 12} = params;

  const data = await http.get<InstagramListResponse>(`${baseUrl}/api/instagram/posts`, {
    query: {after, limit},
  });
  return data;
}

export async function getInstagramProfileServer(): Promise<InstagramProfile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const data = await http.get<InstagramProfile | null>(`${baseUrl}/api/instagram/me`);
  return data;
}
