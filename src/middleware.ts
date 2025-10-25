import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  // Exclude API routes, static files (contain a dot), and Next.js internal paths
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
