'use client';

import {NAVIGATION_ITEMS, SITE_CONFIG} from '@/shared/constants';
import {cn} from '@/shared/lib/utils';
import {Button} from '@/shared/ui/button';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center">
        {/* 로고 */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">{SITE_CONFIG.name}</span>
          </Link>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <svg strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
            <path
              d="M12 3v2.25M6.609 18.609l1.414 1.414M6.609 5.977l1.414-1.414M17.391 18.609l-1.414 1.414M17.391 5.977l-1.414-1.414M12 21v-2.25M4.5 12H2.25M21.75 12H19.5M3.75 12a8.25 8.25 0 1114.5 0 8.25 8.25 0 01-14.5 0z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* 데스크톱 네비게이션 */}
        <nav className="flex items-center space-x-6 text-sm font-medium hidden md:flex">
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
            <Link href={SITE_CONFIG.links.github} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
