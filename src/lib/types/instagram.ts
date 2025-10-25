// Re-export types from main types file
export type {
  InstagramMedia,
  InstagramProfile,
  InstagramListResponse,
  InstagramPaging,
  InstagramPagingCursors,
} from '../types';

// Import InstagramMedia for use in this file
import type {InstagramMedia} from '../types';

// Additional types for Instagram feed
export interface InstagramFeedOptions {
  initialItems?: InstagramMedia[];
  initialAfter?: string;
  pageSize?: number;
}
