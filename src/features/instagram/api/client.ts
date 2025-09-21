import {http} from '@/shared/lib';
import {InstagramListResponse} from '../types';

export async function getInstagramMedia(params: {after?: string; limit?: number} = {}) {
  const {after, limit = 12} = params;
  const data = await http.get<InstagramListResponse>('/api/instagram', {
    query: {after, limit},
  });
  return data;
}
