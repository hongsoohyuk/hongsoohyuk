import {cache} from 'react';

import {getNotionBlockChildrenRecursive} from '@/lib/api/notion-blocks';

import type {NotionBlockWithChildren} from '@/types/notion';

const RESUME_PAGE_ID: Record<string, string> = {
  ko: '3aacc5bea79e815fbe89fef77401bf05',
  en: '33bcc5bea79e817393a9df62483b5b58',
};

export type ResumePageResponse = {
  blocks: NotionBlockWithChildren[];
};

export const getResumePage = cache(async function getResumePage(locale: string = 'ko'): Promise<ResumePageResponse> {
  const pageId = RESUME_PAGE_ID[locale] ?? RESUME_PAGE_ID.ko;
  const blocks = await getNotionBlockChildrenRecursive(pageId);

  return {blocks};
});
