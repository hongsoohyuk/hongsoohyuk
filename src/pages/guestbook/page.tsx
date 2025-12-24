import {fetchInitialGuestbook} from '@/entities/guestbook';
import {parsePositiveInt} from '@/shared/lib/number';
import {GuestbookWidget} from '@/widgets/guestbook';
import {setRequestLocale} from 'next-intl/server';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function GuestbookPage({params, searchParams}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePositiveInt(resolvedSearchParams.page) || 1;

  const initialData = await fetchInitialGuestbook(currentPage);

  return <GuestbookWidget initialData={initialData} />;
}
