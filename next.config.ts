import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  allowedDevOrigins: ['192.168.1.86'],
  images: {
    unoptimized: true,
  },
  // Next.js 16 moved Turbopack config from experimental.turbo to turbopack.
  // next-intl plugin still uses the old key, so we add the alias here manually.
  turbopack: {
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
    },
  },
};

export default withNextIntl(nextConfig);
