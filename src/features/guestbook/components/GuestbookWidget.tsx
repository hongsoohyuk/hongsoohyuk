import {getTranslations} from 'next-intl/server';

import {GuestbookFormDialog} from '@/features/guestbook/components/GuestbookFormDialog';
import {GuestbookList} from '@/features/guestbook/components/GuestbookList';

import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {PaginationBackAndForth} from '@/components/ui/pagination-back-and-forth';
import {GUESTBOOK_LAYOUT_CLASSES} from '@/config';
import {GuestbookListResponse} from '@/features/guestbook/types';
import {Separator} from '@/components/ui/separator';

type Props = {
  data?: GuestbookListResponse;
};

export async function GuestbookWidget({data}: Props) {
  const t = await getTranslations('Guestbook');

  return (
    <Card className={`${GUESTBOOK_LAYOUT_CLASSES.cardHeight} overflow-hidden`}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <CardAction>
          <GuestbookFormDialog />
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <GuestbookList data={data} />
      </CardContent>
      <CardFooter className="flex justify-end shrink-0">
        <PaginationBackAndForth totalPages={data?.pagination?.totalPages ?? 0} />
      </CardFooter>
    </Card>
  );
}
