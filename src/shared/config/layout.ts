export const APP_LAYOUT_CLASSES = {
  headerHeight: 'h-12',
  footerPaddingY: 'py-4',
} as const;

export const GUESTBOOK_LAYOUT_CLASSES = {
  cardHeight: 'h-[calc(100dvh-6rem)]',
  cardHeightLoading: 'h-[calc(100dvh-12rem)]',
  dialogMaxHeight: 'max-h-[calc(100dvh-2rem)]',
} as const;

export const CARD_LAYOUT_CLASSES = {
  root: 'bg-background backdrop-blur supports-[backdrop-filter]:bg-background/20 text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
  header:
    '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
  content: 'px-6',
  footer: 'flex items-center px-6 [.border-t]:pt-6',
} as const;
