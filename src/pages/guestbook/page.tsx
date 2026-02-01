import {setRequestLocale} from 'next-intl/server';

import {GuestbookWidget} from '@/widgets/guestbook/ui/GuestbookWidget';

import {fetchInitialGuestbook} from '@/entities/guestbook/api/list-guestbook';

import {DEFAULT_PAGE} from '@/shared/api/pagination';
import {parsePositiveInt} from '@/shared/lib/number';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function GuestbookPage({params, searchParams}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePositiveInt(resolvedSearchParams.page) ?? DEFAULT_PAGE;

  const data = await fetchInitialGuestbook(currentPage);

  return <GuestbookWidget data={data} />;
}
