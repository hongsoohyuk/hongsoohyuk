import * as React from 'react';

import {Slot} from '@radix-ui/react-slot';
import {MoreHorizontalIcon} from 'lucide-react';

import {cn} from '@/utils/style';

function Breadcrumb({...props}: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({className, ...props}: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn('flex items-center gap-1.5 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function BreadcrumbItem({className, ...props}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5 has-data-[slot=breadcrumb-page]:min-w-0', className)}
      {...props}
    />
  );
}

function BreadcrumbLink({asChild = false, className, ...props}: React.ComponentProps<'a'> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'a';
  return <Comp data-slot="breadcrumb-link" className={cn('hover:underline', className)} {...props} />;
}

function BreadcrumbPage({className, ...props}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-disabled="true"
      aria-current="page"
      className={cn('text-foreground truncate', className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({children, className, ...props}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? '/'}
    </li>
  );
}

function BreadcrumbEllipsis({className, ...props}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
