import {setRequestLocale} from 'next-intl/server';

import {fetchAllGuestbookEntries} from '@/features/guestbook/api';
import {GuestbookWidget} from '@/features/guestbook';

export const dynamic = 'force-static';
export const revalidate = 60;

type Props = {
  params: Promise<{locale: string}>;
};

export default async function GuestbookPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const entries = await fetchAllGuestbookEntries();

  return <GuestbookWidget locale={locale} entries={entries} />;
}
