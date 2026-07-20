import * as React from 'react';

import {Item} from '@/components/ui/item';
import {Skeleton} from '@/components/ui/skeleton';
import {cn} from '@/utils/style';

// Hairline list row shared by the blog and project list cards (previously two byte-identical
// Link shells) and their loading skeletons. Built on the Item family: the row is an
// `Item asChild variant="hairline"` so the caller's <Link> becomes the row anchor and inherits
// the design-system focus ring, while `hairline` strips Item's box chrome (rounded, full border,
// hover fill) down to a bottom divider.
//
// `contentListRowFrame` (vertical padding + bottom divider) is the single source of truth for the
// row's visible box and is reused by ContentListRowSkeleton so the live row and its skeleton can
// never drift.
const contentListRowFrame = 'py-4 border-b border-border/50';

// The original blog/project rows were plain <Link>s that inherited the body type scale
// (text-[15px] leading-relaxed md:text-base from globals.css). Wrapping them in Item pulls in
// Item's base `text-sm`, so we restore the body scale explicitly to preserve visual parity.
const contentListRowClass = cn(
  'group block px-0 text-[15px] leading-relaxed transition-colors duration-150 hover:border-foreground/20 md:text-base',
  contentListRowFrame,
);

// The row wraps the caller's <Link> (asChild) and is always the hairline variant, so those two
// knobs are locked; everything else (href, data-* beacon attrs, extra className) passes through.
type ContentListRowProps = Omit<React.ComponentProps<typeof Item>, 'asChild' | 'variant'>;

function ContentListRow({className, children, ...props}: ContentListRowProps) {
  return (
    <Item asChild variant="hairline" className={cn(contentListRowClass, className)} {...props}>
      {children}
    </Item>
  );
}

// The title/meta baseline row. Defaults to the blog layout (items-center gap-2); the project
// layout composes `items-baseline justify-between gap-4` via className.
function ContentListRowHeader({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="content-list-row-header" className={cn('flex items-center gap-2', className)} {...props} />;
}

// The row title. A plain heading matching the two original call sites exactly; the hover color
// shift uses group-hover, which targets the `group` on ContentListRow.
function ContentListRowTitle({className, children, ...props}: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="content-list-row-title"
      className={cn('truncate font-medium text-foreground/90 transition-colors group-hover:text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

// Right-aligned cluster for date + hover arrow (project layout).
function ContentListRowMeta({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div data-slot="content-list-row-meta" className={cn('flex shrink-0 items-center gap-2', className)} {...props} />
  );
}

// Tight badge strip (blog layout).
function ContentListRowBadges({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="content-list-row-badges" className={cn('flex shrink-0 gap-1', className)} {...props} />;
}

// Line-clamped description line. Vertical spacing (mb-2 / mt-1) is composed via className.
function ContentListRowDescription({className, ...props}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="content-list-row-description"
      className={cn('line-clamp-2 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

// Hover arrow that slides in with the row. Glyph is a child slot (defaults to →) so consumers can
// swap in an icon.
function ContentListRowArrow({className, children = '→', ...props}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="content-list-row-arrow"
      className={cn(
        'text-muted-foreground/0 -translate-x-2 transition-all duration-200 group-hover:translate-x-0 group-hover:text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Loading placeholder that reuses the row frame so it can't drift from the live row.
function ContentListRowSkeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div data-slot="content-list-row-skeleton" className={cn(contentListRowFrame, 'space-y-2', className)} {...props}>
      <div className="flex items-baseline justify-between gap-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export {
  ContentListRow,
  ContentListRowArrow,
  ContentListRowBadges,
  ContentListRowDescription,
  ContentListRowHeader,
  ContentListRowMeta,
  ContentListRowSkeleton,
  ContentListRowTitle,
};
