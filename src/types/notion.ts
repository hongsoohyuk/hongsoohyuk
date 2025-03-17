import type {BlockObjectResponse} from '@notionhq/client/build/src/api-endpoints';

export type NotionBlockWithChildren = BlockObjectResponse & {
  children?: NotionBlockWithChildren[];
};
