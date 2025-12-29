import {GuestbookListResponse} from '../types';

export async function fetchGuestbook({id}: {id: string}): Promise<GuestbookListResponse> {
  const res = await fetch(`/api/guestbook/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.error ?? `Failed to load guestbook with id: ${id}.`;
    throw new Error(message);
  }

  return res.json();
}
