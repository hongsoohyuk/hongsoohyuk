import {PenLine} from 'lucide-react';
import {useTranslations} from 'next-intl';

import {PageHeader, PageHeaderDescription, PageHeaderTitle} from '@/components/layout/page-header';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';

import {GuestbookListSkeleton} from './_components/guestbook-skeleton';

export default function GuestbookLoading() {
  const t = useTranslations('Guestbook');
  return (
    <section className="flex flex-col gap-5 px-4 py-6 md:py-8">
      <PageHeader layout="split">
        <PageHeader layout="inline" asChild>
          <div>
            <PageHeaderTitle className="font-bold text-foreground">{t('title')}</PageHeaderTitle>
            <PageHeaderDescription>{t('description')}</PageHeaderDescription>
          </div>
        </PageHeader>
        <Button size="sm" disabled className="gap-1.5">
          <PenLine className="size-3.5" />
          {t('formSection.trigger')}
        </Button>
      </PageHeader>

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
