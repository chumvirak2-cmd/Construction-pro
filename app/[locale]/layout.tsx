import {NextIntlClientProvider} from 'next-intl'
import {notFound} from 'next/navigation'

const LOCALES = [{'code': 'en', 'name': 'English', 'flag': '🇺🇸'}]

export function generateStaticParams() {
  return LOCALES.map(locale => ({locale: locale.code}))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const { locale } = await params

  if (!LOCALES.some(l => l.code === locale)) {
    notFound()
  }

  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}
