import {z} from 'zod';

import type {EmotionCode, EmotionOption} from './emotion';

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

export type Texts = {
  title: string;
  subtitle: string;
  placeholder: string;
  namePlaceholder: string;
  emotionTitle: string;
  emotionHint: string;
  emotionHelper: string;
  securityTitle: string;
  securityHelper: string;
  button: string;
  buttonPending: string;
  note: string;
  status: {
    success: string;
    error: string;
  };
  validation: {
    name: string;
    message: string;
    emotions: string;
    emotionLimit: string;
    turnstile: string;
  };
  nameLabel: string;
  messageLabel: string;
  triggerLabel: string;
};

export type SubmissionText = Texts;

export type SubmissionEmotionOption = EmotionOption;

export const schema = z.object({
  author_name: z
    .string()
    .trim()
    .min(1, {message: 'Common.validation.required'})
    .max(12, {message: 'Common.validation.maxLength'}),
  message: z
    .string()
    .trim()
    .min(1, {message: 'Common.validation.required'})
    .max(40, {message: 'Common.validation.maxLength'}),
  emotions: z.array(z.string()).max(2, {message: 'Guestbook.formSection.validation.emotionLimit'}).default([]),
});
