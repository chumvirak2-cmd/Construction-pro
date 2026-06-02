'use client'

import { useLocale } from 'next-intl'

export default function BoqSummaryPage() {
  const locale = useLocale()

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">BOQ Summary</h1>
      <p className="mt-3 text-sm text-slate-600">View summary reports for BOQ items and quantity breakdowns.</p>
      <p className="mt-4 text-xs text-slate-500">Locale: {locale}</p>
    </div>
  )
}
