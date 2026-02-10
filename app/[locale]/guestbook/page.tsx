import {setRequestLocale} from 'next-intl/server';

import {fetchGuestbookListServer} from '@/features/guestbook/api';
import {GuestbookWidget} from '@/features/guestbook';

import {DEFAULT_PAGE} from '@/lib/api/pagination';
import {parsePositiveInt} from '@/utils/number';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GuestbookPage({params, searchParams}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePositiveInt(resolvedSearchParams.page) ?? DEFAULT_PAGE;

  const data = await fetchGuestbookListServer(currentPage);

  return <GuestbookWidget data={data} />;
}
