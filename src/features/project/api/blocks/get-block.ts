import {notion} from '@/lib/api/notion';

export async function getNotionBlock(blockId: string) {
  return await notion.blocks.retrieve({
    block_id: blockId,
  });
}
