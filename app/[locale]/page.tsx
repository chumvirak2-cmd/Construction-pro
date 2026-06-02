import { getLocales } from '../lib/get-locales'
import AuthPage from './AuthPage'

export function generateStaticParams() {
  return getLocales().map((locale) => ({ locale: locale.code }))
}

export default function LocalePage() {
  return <AuthPage />
}
