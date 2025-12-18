import {DEFAULT_PAGE_SIZE} from '@/shared/api/pagination';
import {GuestbookEntriesResponse} from '../types';

export async function fetchGuestbookList(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<GuestbookEntriesResponse> {
  const params = new URLSearchParams({page: String(page), pageSize: String(pageSize)});
  const res = await fetch(`/api/guestbook?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.error ?? 'Failed to load guestbook.';
    throw new Error(message);
  }

  return res.json();
}
