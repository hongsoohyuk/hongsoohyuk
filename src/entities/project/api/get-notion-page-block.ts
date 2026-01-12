import {notion} from '@/shared/api/notion';

export async function getNotionPageBlocks(pageId: string) {
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
  });

  return blocks.results;
}
