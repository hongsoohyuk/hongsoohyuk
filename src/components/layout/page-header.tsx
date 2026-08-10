import * as React from 'react';

import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/utils/style';

const pageHeaderVariants = cva('', {
  variants: {
    layout: {
      stacked: 'space-y-2',
      inline: 'flex flex-wrap items-baseline gap-x-3 gap-y-1',
      split: 'flex flex-wrap items-end justify-between gap-3',
    },
  },
  defaultVariants: {
    layout: 'stacked',
  },
});

function PageHeader({
  className,
  layout = 'stacked',
  asChild = false,
  ...props
}: React.ComponentProps<'header'> & VariantProps<typeof pageHeaderVariants> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'header';

  return (
    <Comp
      data-slot="page-header"
      data-layout={layout}
      className={cn(pageHeaderVariants({layout, className}))}
      {...props}
    />
  );
}

const pageHeaderTitleVariants = cva('', {
  variants: {
    size: {
      page: 'text-2xl md:text-3xl font-semibold tracking-tight',
      section: 'text-lg font-semibold',
    },
  },
  defaultVariants: {
    size: 'page',
  },
});

function PageHeaderTitle({
  className,
  size = 'page',
  asChild = false,
  ...props
}: React.ComponentProps<'h1'> & VariantProps<typeof pageHeaderTitleVariants> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'h1';

  return (
    <Comp
      data-slot="page-header-title"
      data-size={size}
      className={cn(pageHeaderTitleVariants({size, className}))}
      {...props}
    />
  );
}

function PageHeaderDescription({className, ...props}: React.ComponentProps<'p'>) {
  return (
    <p data-slot="page-header-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

function PageHeaderActions({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="page-header-actions" className={cn('flex items-center gap-2', className)} {...props} />;
}

export {PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle};
