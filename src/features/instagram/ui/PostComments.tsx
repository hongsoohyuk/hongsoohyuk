'use client';

import {useFormatter} from 'next-intl';

import {InstagramComment} from '@/entities/instagram/model/types';

import {ScrollArea} from '@/shared/ui/scroll-area';

interface PostCommentsProps {
  comments?: InstagramComment[];
  caption?: string;
  username?: string;
}

export function PostComments({comments, caption, username}: PostCommentsProps) {
  const format = useFormatter();

  const hasCaption = caption && caption.trim().length > 0;
  const hasComments = comments && comments.length > 0;

  if (!hasCaption && !hasComments) {
    return null;
  }

  return (
    <ScrollArea className="max-h-32 pr-3">
      <div className="space-y-3 text-sm">
        {hasCaption && (
          <div className="flex gap-2">
            <span className="font-semibold shrink-0">{username}</span>
            <span className="text-foreground/90 whitespace-pre-wrap break-words">{caption}</span>
          </div>
        )}
        {hasComments &&
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <span className="font-semibold shrink-0">{comment.username}</span>
              <div className="flex-1 min-w-0">
                <span className="text-foreground/90 whitespace-pre-wrap break-words">{comment.text}</span>
                <time className="block text-xs text-muted-foreground mt-0.5">
                  {format.relativeTime(new Date(comment.timestamp))}
                </time>
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );
}
