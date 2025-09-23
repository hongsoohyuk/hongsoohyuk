import {httpServer} from '../http';
import {InstagramListResponse} from '../types';

// Server-side API functions
export async function getCVServer() {
  const data = await httpServer.get<InstagramListResponse>(`/api/portfolio`);
  return data;
}

// export async function getCVServer(): Promise<InstagramProfile | null> {
//   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

//   const data = await http.get<InstagramProfile | null>(`${baseUrl}/api/portfolio`);
//   return data;
// }
