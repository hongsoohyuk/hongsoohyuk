import type {BlockObjectResponse} from '@notionhq/client/build/src/api-endpoints';

export type NotionBlockWithChildren = BlockObjectResponse & {
  children?: NotionBlockWithChildren[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
