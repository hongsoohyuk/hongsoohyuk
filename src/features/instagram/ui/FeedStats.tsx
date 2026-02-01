import {Heart, MessageCircle} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {ItemContent, ItemDescription} from '@/shared/ui/item';

export function FeedStats(props: {likeCount?: number; commentsCount?: number}) {
  const t = useTranslations('Instagram.post');

  return (
    <ItemContent className="flex flex-row gap-4">
      <Metric label={t('likes')} value={props.likeCount} icon={<Heart className="size-4" />} />
      <Metric label={t('comments')} value={props.commentsCount} icon={<MessageCircle className="size-4" />} />
    </ItemContent>
  );
}

function Metric({label, value, icon}: {label: string; value?: number; icon: React.ReactNode}) {
  return (
    <ItemDescription className="flex items-center gap-1">
      {icon} {value != null ? value.toLocaleString() : '-'} {label}
    </ItemDescription>
  );
}
