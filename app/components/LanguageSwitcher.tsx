'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { getLocales } from '../lib/get-locales'

export default function LanguageSwitcher() {
  const t = useTranslations('language')
  const pathname = usePathname()
  const router = useRouter()
  const locales = getLocales()

  const handleLocaleChange = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {locales.map((locale) => (
        <button
          key={locale.code}
          onClick={() => handleLocaleChange(locale.code)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <span>{locale.flag}</span>
          <span>{locale.name}</span>
        </button>
      ))}
    </div>
  )
}
