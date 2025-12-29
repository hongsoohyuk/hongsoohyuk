import {http, httpServer} from '@/shared/api/http';
import {DEFAULT_PAGE_SIZE} from '@/shared/api/pagination';
import {GuestbookListResponse} from '../types';

export async function fetchGuestbookList(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<GuestbookListResponse> {
  return http.get<GuestbookListResponse>('/api/guestbook', {
    query: {page, pageSize},
  });
}

export async function fetchInitialGuestbook(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<GuestbookListResponse> {
  return httpServer.get<GuestbookListResponse>('/api/guestbook', {
    query: {page, pageSize},
  });
}
