import {EmotionCode, GUESTBOOK_PAGE_SIZE, GuestbookEntriesResponse} from '@/entities/guestbook';
import {GuestbookWidget} from '@/widgets/guestbook';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {headers} from 'next/headers';
import {buildGuestbookText} from './lib/buildGuestbookText';

type Props = {
  params: Promise<{locale: string}>;
};

const emotionOptions: {code: EmotionCode; emoji: string}[] = [
  {code: 'LIKE', emoji: '🖤'},
  {code: 'INSPIRATION', emoji: '🌊'},
  {code: 'NICE', emoji: '✨'},
  {code: 'HELLO', emoji: '👻'},
  {code: 'FUN', emoji: '🎉'},
  {code: 'THANK', emoji: '😀'},
];

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Guestbook'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Guestbook');
  const common = await getTranslations('Common');
  const initialEntries = await fetchInitialGuestbook();

  const {formText, entriesText, localizedEmotionOptions} = buildGuestbookText({
    tGuestbook: t,
    tCommon: common,
    emotionOptions,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <GuestbookWidget
          locale={locale}
          emotionOptions={localizedEmotionOptions}
          initialData={initialEntries ?? undefined}
          initialPage={1}
          entriesText={entriesText}
          formText={formText}
        />
      </div>
    </div>
  );
}

async function fetchInitialGuestbook(): Promise<GuestbookEntriesResponse | null> {
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  if (!host) return null;

  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/guestbook?page=1&pageSize=${GUESTBOOK_PAGE_SIZE}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}
