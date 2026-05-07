import {getTranslations} from 'next-intl/server';

import {GuestbookFormDialog} from './guestbook-form-dialog';
import {GuestbookShell} from './guestbook-shell';
import type {GuestbookItemDto} from '../_lib/types';

type Props = {
  locale: string;
  entries: GuestbookItemDto[];
};

export async function GuestbookWidget({locale, entries}: Props) {
  const t = await getTranslations({locale, namespace: 'Guestbook'});

  return (
    <section className="flex flex-col gap-5 px-4 py-6 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <GuestbookFormDialog />
      </header>
      <GuestbookShell entries={entries} />
    </section>
  );
}
