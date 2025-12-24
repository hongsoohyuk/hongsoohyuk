import {DEFAULT_PAGE_SIZE} from '@/shared/api/pagination';
import {Button} from '@/shared/ui/button';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/shared/ui/card';
import {PaginationBackAndForth} from '@/shared/ui/pagination-back-and-forth';
import {GuestbookListSkeleton} from '@/widgets/guestbook/ui/GuestbookSkeleton';
import {useTranslations} from 'next-intl';

export default function GuestbookLoading() {
  const t = useTranslations('Guestbook');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <CardAction>
          <Button variant="outline" disabled>
            ✍️ {t('formSection.trigger')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <GuestbookListSkeleton />
      </CardContent>
      <CardFooter className="flex justify-end">
        <PaginationBackAndForth totalPages={DEFAULT_PAGE_SIZE} />
      </CardFooter>
    </Card>
  );
}
