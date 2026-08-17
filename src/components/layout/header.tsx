import {TerminalSquare} from 'lucide-react';
import {getTranslations} from 'next-intl/server';

import {PageContainer} from '@/components/layout/page-container';
import {Button} from '@/components/ui/button';
import {LocaleSwitch} from '@/components/ui/locale-switch';
import {ThemeSwitch} from '@/components/ui/theme-switch';
import {Link} from '@/lib/i18n/routing';
import {SITE_CONFIG} from '@/config/site';
import {APP_LAYOUT_CLASSES} from '@/config';

import {HeaderNav} from './header-nav';

export async function Header() {
  const t = await getTranslations('Header');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <PageContainer size="full" className={`flex ${APP_LAYOUT_CLASSES.headerHeight} items-center`}>
        <HeaderNav siteName={SITE_CONFIG.name} />
        <div className="flex flex-1 items-center justify-end">
          <LocaleSwitch />
          <Button variant="ghost" size="sm" asChild className="h-9 w-9 px-0">
            <Link href="/cli">
              <TerminalSquare className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t('nav.cli')}</span>
            </Link>
          </Button>
          <ThemeSwitch />
        </div>
      </PageContainer>
    </header>
  );
}
