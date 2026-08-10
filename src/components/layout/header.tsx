import {PageContainer} from '@/components/layout/page-container';
import {LocaleSwitch} from '@/components/ui/locale-switch';
import {ThemeSwitch} from '@/components/ui/theme-switch';
import {SITE_CONFIG} from '@/config/site';
import {APP_LAYOUT_CLASSES} from '@/config';

import {HeaderNav} from './header-nav';

export async function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <PageContainer size="full" className={`flex ${APP_LAYOUT_CLASSES.headerHeight} items-center`}>
        <HeaderNav siteName={SITE_CONFIG.name} />
        <div className="flex flex-1 items-center justify-end">
          <LocaleSwitch />
          <ThemeSwitch />
        </div>
      </PageContainer>
    </header>
  );
}
