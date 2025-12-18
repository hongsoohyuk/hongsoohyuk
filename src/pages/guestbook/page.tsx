import {GuestbookEntriesResponse} from '@/entities/guestbook';
import {DEFAULT_PAGE_SIZE} from '@/shared/api/pagination';
import {GuestbookWidget} from '@/widgets/guestbook';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {headers} from 'next/headers';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Guestbook'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export async function GuestbookPage({params, searchParams}: Props) {
  const {locale} = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePositiveInt(resolvedSearchParams.page) || 1;
  setRequestLocale(locale);

  const initialData = await fetchInitialGuestbook(currentPage);
  const totalPages = Math.max(1, initialData?.pagination.totalPages ?? 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <GuestbookWidget initialData={initialData} totalPages={totalPages} />
      </div>
    </div>
  );
}

async function fetchInitialGuestbook(page: number): Promise<GuestbookEntriesResponse | undefined> {
  const headerList = await headers();
  const host = headerList.get('host');
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  if (!host) return undefined;

  const baseUrl = `${protocol}://${host}`;
  const safePage = Math.max(1, page);
  const res = await fetch(`${baseUrl}/api/guestbook?page=${safePage}&pageSize=${DEFAULT_PAGE_SIZE}`, {
    cache: 'no-store',
  });

  if (!res.ok) return undefined;
  return res.json();
}

function parsePositiveInt(value: string | string[] | undefined): number | null {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}
