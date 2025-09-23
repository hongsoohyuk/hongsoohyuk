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
}
