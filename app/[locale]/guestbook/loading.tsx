import {PenLine} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';

import {GuestbookListSkeleton} from './_components/guestbook-skeleton';

export default function GuestbookLoading() {
  const t = useTranslations('Guestbook');
  return (
    <section className="flex flex-col gap-5 px-4 py-6 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button size="sm" disabled className="gap-1.5">
          <PenLine className="size-3.5" />
          {t('formSection.trigger')}
        </Button>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5 overflow-x-auto">
          {Array.from({length: 7}).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key -- 정적 스켈레톤
            <Skeleton key={`chip-skeleton-${index}`} className="h-6 w-20 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <GuestbookListSkeleton />
      </div>
    </section>
  );
}
