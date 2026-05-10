import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'

export default createMiddleware({
  locales: ['en'],
  defaultLocale: 'en'
})

export const config = {
  matcher: ['/', '/en/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}