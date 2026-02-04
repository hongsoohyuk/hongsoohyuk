export interface InstagramMediaChild {
  id: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_url: string;
  thumbnail_url?: string;
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  like_count?: number;
  comments_count?: number;
  username?: string;
  caption?: string;
  timestamp?: string;
  children?: InstagramMediaChild[];
  comments?: InstagramComment[];
}

export interface InstagramPagingCursors {
  before?: string;
  after?: string;
}

export interface InstagramPaging {
  cursors?: InstagramPagingCursors;
  next?: string;
  previous?: string;
}

export interface InstagramListResponse {
  data: InstagramMedia[];
  paging?: InstagramPaging;
}

export interface InstagramProfile {
  id: string;
  username: string;
  website?: string;
  biography?: string;
  followers_count?: number;
  follows_count?: number;
  media_count: number;
  profile_picture_url?: string;
  name?: string;
}

export interface InstagramFeedOptions {
  initialItems?: InstagramMedia[];
  initialAfter?: string;
}
