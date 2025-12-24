import {http, httpServer} from '@/shared/api/http';
import {DEFAULT_PAGE_SIZE} from '@/shared/api/pagination';
import {GuestbookEntriesResponse} from '../types';

export async function fetchGuestbookList(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<GuestbookEntriesResponse> {
  return http.get<GuestbookEntriesResponse>('/api/guestbook', {
    query: {page, pageSize},
  });
}

export async function fetchInitialGuestbook(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<GuestbookEntriesResponse> {
  return httpServer.get<GuestbookEntriesResponse>('/api/guestbook', {
    query: {page, pageSize},
  });
}
