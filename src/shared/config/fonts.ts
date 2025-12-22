import {Geist, Geist_Mono} from 'next/font/google';

/**
 * Shared Font Configuration
 *
 * Following FSD principles - fonts are shared configuration
 */

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/**
 * Get font class names for body element
 */
export function getFontClassNames() {
  return `${geistSans.variable} ${geistMono.variable}`;
}
