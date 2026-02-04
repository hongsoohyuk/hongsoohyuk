export const APP_LAYOUT_CLASSES = {
  headerHeight: 'h-12',
  footerPaddingY: 'py-4',
} as const;

export const GUESTBOOK_LAYOUT_CLASSES = {
  // 모바일: 전체 뷰포트 높이에서 헤더(3rem) 제외
  // 데스크탑: 헤더(3rem) + footer(약 3rem) + 상하 여백(4rem) 제외
  cardHeight: 'h-[calc(100dvh-3rem)] md:h-[calc(100dvh-10rem)]',
  dialogMaxHeight: 'max-h-[calc(100dvh-2rem)]',
} as const;

export const CARD_LAYOUT_CLASSES = {
  // 모바일: 테두리/그림자 없이 최소 패딩, md 이상: 기존 Card 스타일
  root: 'bg-background backdrop-blur supports-[backdrop-filter]:bg-background/20 text-card-foreground flex flex-col gap-4 py-4 md:gap-6 md:rounded-xl md:border md:py-6 md:shadow-sm',
  header:
    '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 md:px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 shrink-0',
  content: 'px-4 md:px-6',
  footer: 'flex items-center px-4 md:px-6 [.border-t]:pt-6',
} as const;
