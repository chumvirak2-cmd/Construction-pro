'use client'

import { useLocale } from 'next-intl'

export default function NewProjectPage() {
  const locale = useLocale()

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">New Project</h1>
      <p className="mt-3 text-sm text-slate-600">Use this page to create a new construction project within Construction Pro.</p>
      <p className="mt-4 text-xs text-slate-500">Locale: {locale}</p>
    </div>
  )
}
