'use client';

import {Button} from '@/component/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/component/ui/dropdown-menu';
import {ThemeSwitch} from '@/component/ui/theme-switch';
import {NAVIGATION_ITEMS, SITE_CONFIG} from '@/lib/constants';
import {cn} from '@/lib/utils';
import {ChevronDownIcon} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center">
        {/* 로고 - 데스크톱에서만 표시 */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">{SITE_CONFIG.name}</span>
          </Link>
        </div>

        {/* 모바일 드롭다운 메뉴 - md 미만에서만 표시 */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="font-bold" asChild>
              <Button variant="ghost" size="sm">
                {SITE_CONFIG.name}
                <ChevronDownIcon className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {NAVIGATION_ITEMS.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link key={item.href} href={item.href} className="w-full">
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 데스크톱 네비게이션 - md 이상에서만 표시 */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href ? 'text-foreground' : 'text-foreground/60',
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* 오른쪽 액션 버튼 */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* 검색 기능은 추후 구현 */}</div>
          <nav className="flex items-center">
            <ThemeSwitch />
            <Link href={SITE_CONFIG.links.linkedin} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm">
                <Image src={'/icon/linkedin.png'} alt="LinkedIn" width={20} height={20} />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </Link>
            <Link href={SITE_CONFIG.links.github} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm">
                <Image src={'/icon/github.png'} alt="GitHub" width={20} height={20} />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
