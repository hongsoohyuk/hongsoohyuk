import {EmotionCode, GUESTBOOK_PAGE_SIZE, GuestbookEntriesResponse} from '@/entities/guestbook';
import {GuestbookWidget} from '@/widgets/guestbook';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {headers} from 'next/headers';
import {buildGuestbookText} from './lib/buildGuestbookText';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export async function Page({params, searchParams}: Props) {
  const {locale} = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePositiveInt(resolvedSearchParams.page) ?? 1;
  setRequestLocale(locale);

  const t = await getTranslations('Guestbook');
  const common = await getTranslations('Common');
  const initialEntries = await fetchInitialGuestbook(currentPage);

  const {formText, entriesText, localizedEmotionOptions} = buildGuestbookText({
    tGuestbook: t,
    tCommon: common,
    emotionOptions,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <GuestbookWidget
          emotionOptions={localizedEmotionOptions}
          initialData={initialEntries ?? undefined}
          initialPage={currentPage}
          entriesText={entriesText}
          formText={formText}
        />
      </div>
    </div>
  );
}

async function fetchInitialGuestbook(page: number): Promise<GuestbookEntriesResponse | null> {
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  if (!host) return null;

  const baseUrl = `${protocol}://${host}`;
  const safePage = Math.max(1, page);
  const res = await fetch(`${baseUrl}/api/guestbook?page=${safePage}&pageSize=${GUESTBOOK_PAGE_SIZE}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}

function parsePositiveInt(value: string | string[] | undefined): number | null {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}
