import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
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
  // WebAssembly support
  webpack: (config, {isServer}) => {
    // WASM 파일 처리
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // .wasm 파일을 asset/resource로 처리
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
