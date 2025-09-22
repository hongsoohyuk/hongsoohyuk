// Shared types used across the application
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  name: string;
  email?: string;
  avatar?: string;
}

export interface GuestbookEntry extends BaseEntity {
  author: User;
  content: string;
  isApproved: boolean;
}

export interface PortfolioItem extends BaseEntity {
  title: string;
  description: string;
  content: string;
  tags: string[];
  isPublished: boolean;
}

export interface InstagramPost extends BaseEntity {
  id: string;
  media_type: string;
  media_url: string;
  username: string;
  caption: string;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
