import {cache} from 'react';

import {getNotionBlockChildrenRecursive} from '@/lib/api/notion-blocks';

import type {NotionBlockWithChildren} from '@/types/notion';

const KO_RESUME_PAGE_ID = '3aacc5bea79e815fbe89fef77401bf05';

// 기존 영문 페이지(33bcc5be…)는 통합 앱에서 조회되지 않아 /en/resume 프리렌더가 실패했다.
// 영문 문서가 준비될 때까지 en도 국문 문서를 바라본다.
const RESUME_PAGE_ID: Record<string, string> = {
  ko: KO_RESUME_PAGE_ID,
  en: KO_RESUME_PAGE_ID,
};

export type ResumePageResponse = {
  blocks: NotionBlockWithChildren[];
};

export const getResumePage = cache(async function getResumePage(locale: string = 'ko'): Promise<ResumePageResponse> {
  const pageId = RESUME_PAGE_ID[locale] ?? RESUME_PAGE_ID.ko;
  const blocks = await getNotionBlockChildrenRecursive(pageId);

  return {blocks};
});
