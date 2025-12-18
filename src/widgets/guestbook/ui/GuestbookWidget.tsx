'use client';

import {GuestbookEntriesResponse} from '@/entities/guestbook';
import {GuestbookFormDialog} from '@/features/guestbook';
import {GuestbookList} from '@/features/guestbook/ui/GuestbookList';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Pagination,
} from '@/shared/ui';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Suspense} from 'react';
import {GuestbookEntriesSkeleton} from './GuestbookEntriesSkeleton';

type Props = {
  initialData?: GuestbookEntriesResponse;
  totalPages: number;
};

export function GuestbookWidget({initialData, totalPages}: Props) {
  const queryClient = useQueryClient();
  const t = useTranslations('Guestbook');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <CardAction>
          <GuestbookFormDialog
            onSubmitted={() => {
              queryClient.invalidateQueries({queryKey: ['guestbookEntries']});
            }}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<GuestbookEntriesSkeleton />}>
          <GuestbookList initialData={initialData} />
        </Suspense>
      </CardContent>
      <CardFooter>
        <Pagination totalPages={totalPages} />
      </CardFooter>
    </Card>
  );
}
