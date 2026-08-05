const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/**
 * Config used ONLY for the static export (`out/`) consumed by the
 * Android/iOS Capacitor build (capacitor.config.ts -> webDir: 'out').
 *
 * The default next.config.js uses `output: 'standalone'` for the hosted
 * web/server deployment. A static export cannot include API routes, so the
 * mobile build is generated with this config (the native shell already
 * falls back to localStorage when /api calls are unavailable).
 */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  compress: true,
  experimental: {
    optimizePackageImports: ['react', 'next-intl'],
  },
  webpack: (config) => {
    config.watchOptions = {
      ignored: /node_modules|[\\/]seed-data[\\/]|[\\/]audit[\\/]/,
      aggregateTimeout: 200,
    };
    return config;
  },
};

module.exports = withNextIntl(nextConfig);
