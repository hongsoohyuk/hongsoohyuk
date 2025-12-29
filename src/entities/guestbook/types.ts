import type {EmotionCode} from '../emotion/model/type';

export type GuestbookItemDto = {
  id: string;
  author_name: string;
  message: string;
  emotions: EmotionCode[] | null;
  created_at: string;
};

export type GuestbookPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type GuestbookListResponse = {
  entries: GuestbookItemDto[];
  pagination: GuestbookPagination;
};

export type CreateGuestbookEntryPayload = {
  author_name: string;
  message: string;
  emotions: EmotionCode[];
  turnstile_token: string;
};

export const GUESTBOOK_PAGE_SIZE = 5;
