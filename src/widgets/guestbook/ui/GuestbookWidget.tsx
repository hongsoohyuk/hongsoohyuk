import {GuestbookListResponse} from '@/entities/guestbook';
import {GuestbookFormDialog} from '@/features/guestbook';
import {GuestbookList} from '@/features/guestbook/ui/GuestbookList';
import {GUESTBOOK_LAYOUT_CLASSES} from '@/config';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/shared/ui/card';
import {PaginationBackAndForth} from '@/shared/ui/pagination-back-and-forth';
import {getTranslations} from 'next-intl/server';

type Props = {
  data?: GuestbookListResponse;
};

export async function GuestbookWidget({data}: Props) {
  const t = await getTranslations('Guestbook');

  return (
    <Card className={GUESTBOOK_LAYOUT_CLASSES.cardHeight}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <CardAction>
          <GuestbookFormDialog />
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <GuestbookList data={data} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <PaginationBackAndForth totalPages={data?.pagination?.totalPages ?? 0} />
      </CardFooter>
    </Card>
  );
}
