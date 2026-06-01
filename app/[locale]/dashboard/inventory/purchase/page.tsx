'use client'

import { useLocale } from 'next-intl'

export default function InventoryPurchasePage() {
  const locale = useLocale()

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
      <p className="mt-3 text-sm text-slate-600">Manage purchase orders and supplier deliveries for construction materials.</p>
      <p className="mt-4 text-xs text-slate-500">Locale: {locale}</p>
    </div>
  )
}
