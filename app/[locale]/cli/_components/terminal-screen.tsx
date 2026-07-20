import * as React from 'react';

import {cn} from '@/utils/style';

function TerminalScreen({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- role="application"이 키 입력 위임 컨테이너로 설정되어 tabIndex 필요
      tabIndex={0}
      role="application"
      data-slot="terminal-screen"
      className={cn(
        'h-full flex flex-col bg-neutral-950 text-neutral-200 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        className,
      )}
      {...props}
    />
  );
}

export {TerminalScreen};
