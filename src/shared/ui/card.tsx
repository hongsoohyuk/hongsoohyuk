import * as React from 'react';

import {cn} from '@/shared/lib/style';
import {CARD_LAYOUT_CLASSES} from '@/config';

function Card({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(CARD_LAYOUT_CLASSES.root, className)}
      {...props}
    />
  );
}

function CardHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(CARD_LAYOUT_CLASSES.header, className)}
      {...props}
    />
  );
}

function CardTitle({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('leading-none font-semibold', className)} {...props} />;
}

function CardDescription({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardAction({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

function CardContent({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(CARD_LAYOUT_CLASSES.content, className)} {...props} />;
}

function CardFooter({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-footer" className={cn(CARD_LAYOUT_CLASSES.footer, className)} {...props} />
  );
}

export {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle};
