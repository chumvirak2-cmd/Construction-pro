import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'

export default createMiddleware({
  locales: ['en', 'km'],
  defaultLocale: 'en'
})

export const config = {
  matcher: ['/', '/(km|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}