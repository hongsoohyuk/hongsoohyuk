export const QueryKeyFactory = {
  list: (page: number) => ['guestbook', 'list', page] as const,
};
