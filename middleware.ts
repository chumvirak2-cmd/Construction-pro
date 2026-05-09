import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'km'],
  defaultLocale: 'en'
})

export const config = {
  matcher: ['/', '/(km|en)/:path*']
}