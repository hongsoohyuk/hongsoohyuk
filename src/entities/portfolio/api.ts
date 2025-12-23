import {httpServer} from '@/shared/api/http';
import {InstagramListResponse} from '@/entities/instagram';

// Server-side API functions
export async function getCVServer() {
  const data = await httpServer.get<InstagramListResponse>(`/api/portfolio`);
  return data;
}
