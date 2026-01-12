import {notion} from '@/shared/api/notion';

export async function getNotionBlockChildren(blockId: string) {
  return await notion.blocks.children.list({
    block_id: blockId,
  });
}
