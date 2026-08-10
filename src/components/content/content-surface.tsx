import * as React from 'react';

import {Slot} from '@radix-ui/react-slot';

import {cn} from '@/utils/style';

// The content panel surface shared verbatim by blog/[slug], project/[slug] and resume
// (pages + their loading skeletons). Callers append their own spacing (space-y-6, h-screen)
// through className so the surface string itself lives in exactly one place.
const contentSurfaceClass = 'rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-6 md:p-8';

function ContentSurface({className, asChild = false, ...props}: React.ComponentProps<'section'> & {asChild?: boolean}) {
  const Comp = asChild ? Slot : 'section';

  return <Comp data-slot="content-surface" className={cn(contentSurfaceClass, className)} {...props} />;
}

export {ContentSurface};
