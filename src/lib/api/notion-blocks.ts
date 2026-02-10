import {notion} from '@/lib/api/notion';

import type {NotionBlockWithChildren} from '@/types/notion';
import type {BlockObjectResponse} from '@notionhq/client/build/src/api-endpoints';

export async function getNotionBlockChildren(blockId: string) {
  return await notion.blocks.children.list({
    block_id: blockId,
  });
}

export async function getNotionBlockChildrenRecursive(blockId: string): Promise<NotionBlockWithChildren[]> {
  const response = await notion.blocks.children.list({
    block_id: blockId,
  });

  const blocks = response.results as BlockObjectResponse[];

  const blocksWithChildren: NotionBlockWithChildren[] = await Promise.all(
    blocks.map(async (block) => {
      if (block.has_children) {
        const children = await getNotionBlockChildrenRecursive(block.id);
        return {...block, children};
      }
      return block;
    }),
  );

  return blocksWithChildren;
}
