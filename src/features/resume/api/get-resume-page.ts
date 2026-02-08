import {cache} from 'react';

import {getNotionBlockChildrenRecursive} from '@/lib/api/notion-blocks';

import {RESUME_PAGE_ID} from '../config/constant';

import type {NotionBlockWithChildren} from '@/types/notion';

export type ResumePageResponse = {
  blocks: NotionBlockWithChildren[];
};

export const getResumePage = cache(async function getResumePage(): Promise<ResumePageResponse> {
  const blocks = await getNotionBlockChildrenRecursive(RESUME_PAGE_ID);

  return {
    blocks,
  };
});
