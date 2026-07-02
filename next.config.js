const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  allowedDevOrigins: ['172.22.240.1', '172.22.112.1', '172.28.16.1', '10.22.2.254', '10.22.2.147', '10.22.2.157', '10.22.2.171', '10.22.2.206', '172.26.0.1', '172.29.176.1', '172.29.160.1'],
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
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devServer = {
        ...config.devServer,
        client: {
          ...config.devServer?.client,
          overlay: false,
        },
        hot: 'only',
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