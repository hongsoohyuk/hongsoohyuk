import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

const nextConfig: NextConfig = {
  // TypeScript and ESLint - don't fail build on errors
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/PokeAPI/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },
};

export default withNextIntl(nextConfig);
