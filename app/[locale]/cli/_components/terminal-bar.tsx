import * as React from 'react';

import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/utils/style';

const terminalBarVariants = cva('shrink-0 bg-neutral-800 px-3 py-1 text-xs', {
  variants: {
    layout: {
      row: 'flex items-center justify-between',
      plain: '',
    },
    tone: {
      muted: 'text-neutral-400',
      subtle: 'text-neutral-500',
      none: '',
    },
  },
  defaultVariants: {
    layout: 'row',
    tone: 'muted',
  },
});

function TerminalBar({
  className,
  layout,
  tone,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof terminalBarVariants>) {
  return <div data-slot="terminal-bar" className={cn(terminalBarVariants({layout, tone, className}))} {...props} />;
}

export {TerminalBar, terminalBarVariants};
