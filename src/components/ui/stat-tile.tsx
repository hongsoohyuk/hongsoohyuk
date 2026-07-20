import * as React from 'react';

import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/utils/style';

const statTileVariants = cva('', {
  variants: {
    variant: {
      default: 'rounded-lg border p-4',
      plain: 'flex flex-col items-start md:flex-row md:gap-1 md:items-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function StatTile({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof statTileVariants> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="stat-tile"
      data-variant={variant}
      className={cn(statTileVariants({variant, className}))}
      {...props}
    />
  );
}

function StatTileLabel({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="stat-tile-label" className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function StatTileValue({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div data-slot="stat-tile-value" className={cn('mt-1 text-2xl font-semibold tabular-nums', className)} {...props} />
  );
}

export {StatTile, StatTileLabel, StatTileValue, statTileVariants};
