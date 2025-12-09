'use client';

import {Button, Modal} from '@/component/ui';
import {InstagramMedia} from '@/lib/types/instagram';
import clsx from 'clsx';
import {Heart, MessageCircle, PlayCircle, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {memo, ReactNode} from 'react';
import {PostMediaViewer} from './PostMediaViewer';

interface PostDetailModalProps {
  post: InstagramMedia | null;
  open: boolean;
  onClose: () => void;
}

export const PostDetailModal = memo(function PostDetailModal({post, open, onClose}: PostDetailModalProps) {
  const t = useTranslations('Instagram.post');
  const labelledBy = post ? `instagram-post-${post.id}-title` : undefined;
  const describedBy = post ? `instagram-post-${post.id}-description` : undefined;

  if (!post) {
    return null;
  }

  const likeCount = post.like_count ?? 0;
  const commentsCount = post.comments_count ?? 0;
  const caption = post.caption?.trim();
  const isReel = post.media_type === 'VIDEO';

  const formattedTimestamp = formatTimestamp(post.timestamp);

  return (
    <Modal open={open} onClose={onClose} labelledBy={labelledBy} describedBy={describedBy}>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="md:min-w-[320px] md:flex-1">
          <PostMediaViewer post={post} className="md:aspect-[4/5]" />
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <p id={labelledBy} className="text-base font-semibold leading-tight">
                @{post.username ?? 'user'}
              </p>
              {formattedTimestamp && (
                <time dateTime={post.timestamp} className="text-sm text-muted-foreground">
                  {formattedTimestamp}
                </time>
              )}
            </div>
            <Button variant="ghost" size="icon" aria-label={t('close')} onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {caption && (
            <p id={describedBy} className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {caption}
            </p>
          )}

          <EngagementSummary likeCount={likeCount} commentsCount={commentsCount} isReel={isReel} />
        </div>
      </div>
    </Modal>
  );
});

interface EngagementSummaryProps {
  likeCount: number;
  commentsCount: number;
  isReel: boolean;
}

function EngagementSummary({likeCount, commentsCount, isReel}: EngagementSummaryProps) {
  const t = useTranslations('Instagram.post');

  return (
    <section className="rounded-2xl border border-border bg-muted/40 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t('engagement', {default: '상호작용'})}
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-4">
        <Metric label={t('likes')} value={likeCount} icon={<Heart className="size-4" />} />
        <Metric
          label={t('comments', {default: '댓글'})}
          value={commentsCount}
          icon={<MessageCircle className="size-4" />}
        />
      </dl>

      {isReel && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
          <PlayCircle className="size-4 shrink-0" />
          <span>{t('reelNotice', {default: '이 게시물은 릴(Reel) 입니다. 사운드를 켜고 감상해 보세요.'})}</span>
        </div>
      )}
    </section>
  );
}

interface MetricProps {
  label: string;
  value: number;
  icon?: ReactNode;
}

function Metric({label, value, icon}: MetricProps) {
  return (
    <div className="flex flex-col rounded-xl bg-background/80 p-3 shadow-[0_1px_3px_theme(colors.black/10%)]">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </dt>
      <dd className={clsx('mt-1 text-lg font-semibold', value === 0 && 'text-muted-foreground')}>
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

function formatTimestamp(timestamp?: string | null) {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString();
}
