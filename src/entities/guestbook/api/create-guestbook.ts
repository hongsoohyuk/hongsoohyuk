import {http} from '@/shared/api/http';

import {CreateGuestbookEntryPayload} from '../types';

export async function createGuestbookEntry(payload: CreateGuestbookEntryPayload): Promise<void> {
  await http.post<void, CreateGuestbookEntryPayload>('/api/guestbook', payload);
}
