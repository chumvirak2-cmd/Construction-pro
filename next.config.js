const createNextIntlPlugin = require('next-intl/plugin');
const os = require('os');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// Collect the machine's LAN IPv4 addresses so the dev server can be reached
// from other devices (phones, tablets) on the network. Next.js 16 blocks
// dev-only client resources for any origin not listed in allowedDevOrigins,
// which otherwise leaves pages rendered but non-interactive (dead buttons).
function getLanIpAddresses() {
  const addresses = new Set();
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.add(iface.address);
      }
    }
  }
  return Array.from(addresses);
}

const allowedDevOrigins = [
  'localhost',
  '127.0.0.1',
  ...getLanIpAddresses()
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  allowedDevOrigins,
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