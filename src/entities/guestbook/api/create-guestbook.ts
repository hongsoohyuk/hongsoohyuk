import {CreateGuestbookEntryPayload} from '../types';

export async function createGuestbookEntry(payload: CreateGuestbookEntryPayload): Promise<void> {
  const res = await fetch('/api/guestbook', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const responseBody = await res.json().catch(() => ({}));
    const message = responseBody?.error ?? 'Failed to submit guestbook entry.';
    throw new Error(message);
  }
}
