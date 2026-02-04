export const queryKeyFactory = {
  post: (id: string) => ['instagram', 'post', id] as const,
  infiniteListMedia: () => ['instagram', 'infinite-list-media'] as const,
  profile: () => ['instagram', 'profile'] as const,
} as const;
