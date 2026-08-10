import * as React from 'react';

import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/utils/style';

const pageContainerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      content: 'max-w-3xl px-4',
      wide: 'max-w-4xl',
      full: 'container max-w-screen-2xl',
    },
  },
  defaultVariants: {
    size: 'content',
  },
});

function PageContainer({
  className,
  size = 'content',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof pageContainerVariants> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="page-container"
      data-size={size}
      className={cn(pageContainerVariants({size, className}))}
      {...props}
    />
  );
}

export {PageContainer, pageContainerVariants};
