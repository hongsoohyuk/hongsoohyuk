import * as React from 'react';

import {cva, type VariantProps} from 'class-variance-authority';
import {Bot} from 'lucide-react';

import {cn} from '@/utils/style';

import type {ChatMessage as ChatMessageData} from '../_lib/types';

function ChatAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
      <Bot className="size-4" />
    </div>
  );
}

const chatBubbleVariants = cva('rounded-2xl px-4 py-3 text-sm', {
  variants: {
    variant: {
      user: 'max-w-[75%] leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground',
      assistant: 'max-w-[75%] leading-relaxed whitespace-pre-wrap bg-muted/50 text-foreground',
      loading: 'bg-muted/50',
    },
  },
  defaultVariants: {
    variant: 'assistant',
  },
});

function ChatBubble({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof chatBubbleVariants>) {
  return <div className={cn(chatBubbleVariants({variant, className}))} {...props} />;
}

function ChatMessage({role, children}: {role: ChatMessageData['role']; children: React.ReactNode}) {
  const isUser = role === 'user';

  return (
    <div className={cn('chat-message-item flex gap-3', isUser && 'flex-row-reverse')}>
      {role === 'assistant' && <ChatAvatar />}
      <ChatBubble variant={isUser ? 'user' : 'assistant'}>{children}</ChatBubble>
    </div>
  );
}

export {ChatAvatar, ChatBubble, ChatMessage};
