import * as React from 'react';

import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/utils/style';

const emptyVariants = cva('flex min-w-0 flex-col', {
  variants: {
    variant: {
      default: 'flex-1 items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12',
      inline: 'gap-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Empty({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyVariants>) {
  return (
    <div data-slot="empty" data-variant={variant} className={cn(emptyVariants({variant, className}))} {...props} />
  );
}

function EmptyHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn('flex max-w-sm flex-col items-center gap-2 text-center', className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(emptyMediaVariants({variant, className}))}
      {...props}
    />
  );
}

function EmptyTitle({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="empty-title" className={cn('text-lg font-medium tracking-tight', className)} {...props} />;
}

function EmptyDescription({className, ...props}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        'text-sm text-muted-foreground',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn('flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance', className)}
      {...props}
    />
  );
}

export {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, emptyVariants};
