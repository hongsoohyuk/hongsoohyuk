import {APP_LAYOUT_CLASSES} from '@/shared/config';
import {SITE_CONFIG} from '@/shared/config/site';
import {LocaleSwitch} from '@/shared/ui/locale-switch';
import {ThemeSwitch} from '@/shared/ui/theme-switch';
import {HeaderNav} from './header-nav';

export async function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className={`container mx-auto flex ${APP_LAYOUT_CLASSES.headerHeight} max-w-screen-2xl items-center`}>
        <HeaderNav siteName={SITE_CONFIG.name} />
        <div className="flex flex-1 items-center justify-end">
          <LocaleSwitch />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
