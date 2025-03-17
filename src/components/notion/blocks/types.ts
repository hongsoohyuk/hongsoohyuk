import type {ReactNode} from 'react';

import type {BlockObjectResponse} from '@notionhq/client/build/src/api-endpoints';

import type {NotionBlockWithChildren} from '@/types/notion';

/** Narrows NotionBlockWithChildren to a specific block type */
export type NarrowBlock<T extends BlockObjectResponse['type']> = Extract<BlockObjectResponse, {type: T}> & {
  children?: NotionBlockWithChildren[];
};

export type BlockProps = {
  block: NotionBlockWithChildren;
  allBlocks?: NotionBlockWithChildren[];
  renderChildren: (block: NotionBlockWithChildren) => ReactNode;
  renderBlocks: (blocks: NotionBlockWithChildren[], className?: string) => ReactNode;
};
