import {notion} from '@/shared/api/notion';

export async function getNotionPage(pageId: string) {
  return await notion.pages.retrieve({
    page_id: pageId,
  });
}
