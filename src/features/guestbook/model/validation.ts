import { z } from 'zod';

export const schema = z.object({
  author_name: z
    .string()
    .trim()
    .nonempty({message: 'formSection.nameRequired'})
    .max(12, {message: 'formSection.nameTooLong'}),
  message: z
    .string()
    .trim()
    .nonempty({message: 'formSection.messageRequired'})
    .max(40, {message: 'formSection.messageTooLong'}),
  emotions: z.array(z.string()).max(2, {message: 'formSection.emotionLimit'}).default([]),
});
