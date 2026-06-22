import { redirect } from 'next/navigation'
import { getDefaultLocale } from './lib/get-locales'

export default function Page() {
  redirect(`/${getDefaultLocale()}/`)
}
