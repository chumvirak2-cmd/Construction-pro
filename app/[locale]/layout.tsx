import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import {notFound} from 'next/navigation'
import {getLocales} from '../lib/get-locales'

const localesCache = new Map()

export function generateStaticParams() {
  return getLocales().map(locale => ({locale: locale.code}))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const { locale } = await params

  if (!getLocales().some(l => l.code === locale)) {
    notFound()
  }

  const messages = localesCache.has(locale) 
    ? localesCache.get(locale) 
    : await getMessages()
  
  if (!localesCache.has(locale)) {
    localesCache.set(locale, messages)
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
