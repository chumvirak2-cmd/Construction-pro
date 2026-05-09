import {NextIntlClientProvider} from 'next-intl'
import {getMessages} from 'next-intl/server'
import {notFound} from 'next/navigation'
import {getLocales} from '../lib/get-locales'

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

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
