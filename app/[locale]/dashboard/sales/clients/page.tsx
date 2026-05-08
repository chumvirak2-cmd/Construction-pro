'use client'

import { useState } from 'react'

export default function SalesClients() {
  const [clients, setClients] = useState<any[]>([])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
          <p className="text-gray-500">Manage your client relationships</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>➕</span> Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Client Management</h3>
        <p className="text-gray-500">
          View and manage all client information and interaction history.
        </p>
      </div>
    </div>
  )
}
