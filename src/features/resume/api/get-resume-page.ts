import {cache} from 'react';

import {getNotionBlockChildrenRecursive} from '@/lib/api/notion-blocks';

import type {NotionBlockWithChildren} from '@/types/notion';
import {RESUME_PAGE_ID} from '../config/constant';


export type ResumePageResponse = {
  blocks: NotionBlockWithChildren[];
};

export const getResumePage = cache(async function getResumePage(locale: string = 'ko'): Promise<ResumePageResponse> {
  const pageId = RESUME_PAGE_ID[locale] ?? RESUME_PAGE_ID.ko;
  const blocks = await getNotionBlockChildrenRecursive(pageId);

  return {
    blocks,
  };
});
