'use client'

import { useLocale } from 'next-intl'

export default function BoqUploadPage() {
  const locale = useLocale()

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">BOQ Upload</h1>
      <p className="mt-3 text-sm text-slate-600">Upload Bill of Quantities files to keep your cost estimates up to date.</p>
      <p className="mt-4 text-xs text-slate-500">Locale: {locale}</p>
    </div>
  )
}
