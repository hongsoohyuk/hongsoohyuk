import {GuestbookEntriesResponse} from '@/entities/guestbook';
import {GuestbookFormDialog} from '@/features/guestbook';
import {GuestbookList} from '@/features/guestbook/ui/GuestbookList';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/shared/ui/card';
import {getTranslations} from 'next-intl/server';

type Props = {
  initialData?: GuestbookEntriesResponse;
};

export async function GuestbookWidget({initialData}: Props) {
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
        <GuestbookList initialData={initialData} />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
