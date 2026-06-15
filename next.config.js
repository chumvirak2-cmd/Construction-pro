const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  allowedDevOrigins: ['172.22.240.1', '172.22.112.1', '172.28.16.1', '10.22.2.254', '10.22.2.147', '10.22.2.157', '10.22.2.171', '10.22.2.206', '172.26.0.1'],
  images: {
    unoptimized: true,
  },
  compress: true,
  onDemandEntries: {
    maxInactiveAge: 5 * 60 * 1000,
    pagesBufferLength: 5,
  },
  experimental: {
    optimizePackageImports: ['react', 'next-intl'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              minChunks: 1,
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    config.watchOptions = {
      ignored: /node_modules|[\\/]seed-data[\\/]|[\\/]audit[\\/]/,
      aggregateTimeout: 200,
    }
    return config
  },
}

module.exports = withNextIntl(nextConfig)