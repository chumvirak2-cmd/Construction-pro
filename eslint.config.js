const nextConfig = require('eslint-config-next')

module.exports = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'android/**',
      'ios/**',
      'resources/**',
      '.idea/**',
      '.kilo/**',
      '.agents/**',
      'node_modules/**'
    ]
  },
  ...nextConfig,
  {
    rules: {
      '@next/next/no-img-element': 'off'
    }
  }
]
