'use client';

import {Card, CardContent} from '@/component/ui';
import {useTranslations} from 'next-intl';

interface EmptyStateProps {
  icon?: string;
}

export function EmptyState({icon = '📷'}: EmptyStateProps) {
  const t = useTranslations('Instagram.empty');

  return (
    <Card>
      <CardContent className="py-16 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">
          {icon}
        </div>
        <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </CardContent>
    </Card>
  );
}
