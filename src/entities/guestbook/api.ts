import {CreateGuestbookEntryPayload, GUESTBOOK_PAGE_SIZE, GuestbookEntriesResponse} from './types';

const JSON_HEADERS = {'Content-Type': 'application/json'};

export async function fetchGuestbookEntries(
  page: number,
  pageSize: number = GUESTBOOK_PAGE_SIZE,
): Promise<GuestbookEntriesResponse> {
  const params = new URLSearchParams({page: String(page), pageSize: String(pageSize)});
  const res = await fetch(`/api/guestbook?${params.toString()}`, {
    headers: JSON_HEADERS,
    cache: 'no-store',
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.error ?? 'Failed to load guestbook.';
    throw new Error(message);
  }

  return res.json();
}

export async function createGuestbookEntry(payload: CreateGuestbookEntryPayload): Promise<void> {
  const res = await fetch('/api/guestbook', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const responseBody = await res.json().catch(() => ({}));
    const message = responseBody?.error ?? 'Failed to submit guestbook entry.';
    throw new Error(message);
  }
}
