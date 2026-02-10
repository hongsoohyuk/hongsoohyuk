import {z} from 'zod';

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
