'use client';

import {useTranslations} from 'next-intl';

export function EndOfFeed() {
  const t = useTranslations('Instagram');

  return (
    <div className="text-center py-4 text-sm text-muted-foreground" role="status">
      {t('endOfFeed')}
    </div>
  );
}
