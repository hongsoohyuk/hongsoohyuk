/**
 * Instagram feed styling constants
 */
export const IG_FEED_STYLES = {
  gridColsClass: 'grid grid-cols-3 gap-0.5', // 3 columns for desktop layout
  itemAspectClass: 'aspect-[4/5]', // 4:5 aspect ratio (Instagram standard)
} as const;

/**
 * Instagram feed configuration
 */
export const IG_FEED_CONFIG = {
  defaultPageSize: 12,
  loadMoreThreshold: 200, // pixels before end of scroll to trigger load
  staleTime: 60 * 1000, // 1 minute
} as const;
