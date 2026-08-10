import {getTranslations} from 'next-intl/server';

import {PageHeader, PageHeaderDescription, PageHeaderTitle} from '@/components/layout/page-header';

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
      <PageHeader layout="split">
        <PageHeader layout="inline" asChild>
          <div>
            <PageHeaderTitle className="font-bold text-foreground">{t('title')}</PageHeaderTitle>
            <PageHeaderDescription>{t('description')}</PageHeaderDescription>
          </div>
        </PageHeader>
        <GuestbookFormDialog />
      </PageHeader>
      <GuestbookShell entries={entries} />
    </section>
  );
}
