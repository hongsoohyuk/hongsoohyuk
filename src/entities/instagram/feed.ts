import type {InstagramMedia} from './types';

// Additional types for Instagram feed
export interface InstagramFeedOptions {
  initialItems?: InstagramMedia[];
  initialAfter?: string;
  pageSize?: number;
}
