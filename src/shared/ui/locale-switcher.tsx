'use client';

import {Button} from '@/shared/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/shared/ui/dropdown-menu';
import {localeFlags, localeNames, locales, type Locale} from '@/shared/i18n/config';
import {usePathname, useRouter} from '@/shared/i18n/routing';
import {GlobeIcon} from 'lucide-react';
import {useParams} from 'next/navigation';
import {useTransition} from 'react';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const currentLocale = (params.locale as Locale) || 'ko';

  function onSelectChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <GlobeIcon className="h-5 w-5" />
          <span className="sr-only">언어 변경</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => onSelectChange(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            <span className="mr-2">{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
