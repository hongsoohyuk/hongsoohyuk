import {GuestbookEntriesResponse} from '@/entities/guestbook';
import {GuestbookFormDialog} from '@/features/guestbook';
import {GuestbookList} from '@/features/guestbook/ui/GuestbookList';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/shared/ui/card';
import {PaginationBackAndForth} from '@/shared/ui/pagination-back-and-forth';
import {getTranslations} from 'next-intl/server';

type Props = {
  data?: GuestbookEntriesResponse;
};

export async function GuestbookWidget({data}: Props) {
  const t = await getTranslations('Guestbook');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <CardAction>
          <GuestbookFormDialog />
        </CardAction>
      </CardHeader>
      <CardContent>
        <GuestbookList data={data} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <PaginationBackAndForth totalPages={data?.pagination?.totalPages ?? 0} />
      </CardFooter>
    </Card>
  );
}
