import {LocaleSwitcher} from '@/shared/ui/locale-switcher';
import {ThemeSwitch} from '@/shared/ui/theme-switch';
import {SITE_CONFIG} from '@/shared/config/site';
import {HeaderNav} from './header-nav';

export async function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center">
        <HeaderNav siteName={SITE_CONFIG.name} />

        <div className="flex flex-1 items-center justify-between space-x-2 justify-end">
          <nav className="flex items-center">
            <LocaleSwitcher />
            <ThemeSwitch />
          </nav>
        </div>
      </div>
    </header>
  );
}
