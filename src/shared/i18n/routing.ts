import {createNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['ko', 'en'],

  // Used when no locale matches
  defaultLocale: 'ko',

  // Prefix strategy:
  // - Default locale(ko): no prefix (e.g., `/instagram`)
  // - Other locales: prefixed (e.g., `/en/instagram`)
  // - Requests to `/ko/...` will be normalized (typically redirected) to `/...`
  localePrefix: 'as-needed',

  // Keep default locale stable for unprefixed routes.
  localeDetection: false,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
