import {useTranslations} from 'next-intl';


import {Button} from '@/components/ui/button';
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {PaginationBackAndForth} from '@/components/ui/pagination-back-and-forth';
import {DEFAULT_PAGE_SIZE} from '@/lib/api/pagination';
import {GUESTBOOK_LAYOUT_CLASSES} from '@/config';
import {GuestbookListSkeleton} from '@/features/guestbook';

export default function GuestbookLoading() {
  const t = useTranslations('Guestbook');
  return (
    <Card className={GUESTBOOK_LAYOUT_CLASSES.cardHeight}>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
        <CardAction>
          <Button variant="outline" disabled>
            {t('formSection.trigger')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <GuestbookListSkeleton />
      </CardContent>
      <CardFooter className="flex justify-end shrink-0">
        <PaginationBackAndForth totalPages={DEFAULT_PAGE_SIZE} />
      </CardFooter>
    </Card>
  );
}
