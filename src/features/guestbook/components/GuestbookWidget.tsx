import {Suspense} from 'react';

import {getTranslations} from 'next-intl/server';

import {GuestbookFormDialog} from '@/features/guestbook/components/GuestbookFormDialog';
import {GuestbookList} from '@/features/guestbook/components/GuestbookList';

import {GuestbookItemDto} from '@/features/guestbook/types';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {PaginationBackAndForth} from '@/components/ui/pagination-back-and-forth';
import {Separator} from '@/components/ui/separator';
import {GUESTBOOK_LAYOUT_CLASSES} from '@/config';
import {DEFAULT_PAGE_SIZE} from '@/lib/api/pagination';

type Props = {
  locale: string;
  entries: GuestbookItemDto[];
};

export async function GuestbookWidget({locale, entries}: Props) {
  const t = await getTranslations({locale, namespace: 'Guestbook'});
  const totalPages = Math.max(1, Math.ceil(entries.length / DEFAULT_PAGE_SIZE));

  return (
    <Card className={`${GUESTBOOK_LAYOUT_CLASSES.cardHeight} overflow-hidden border-0 md:border`}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <CardAction>
          <GuestbookFormDialog />
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <Suspense>
          <GuestbookList entries={entries} />
        </Suspense>
      </CardContent>
      <CardFooter className="flex justify-end shrink-0">
        <Suspense>
          <PaginationBackAndForth totalPages={totalPages} />
        </Suspense>
      </CardFooter>
    </Card>
  );
}
