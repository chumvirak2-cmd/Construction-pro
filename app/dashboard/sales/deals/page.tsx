'use client'

import { useState } from 'react'

export default function SalesDeals() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
          <p className="text-gray-500">Track sales opportunities and deals</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>🤝</span> New Deal
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">💼</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Deal Pipeline</h3>
        <p className="text-gray-500">
          Manage sales pipeline from prospect to close.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">0</div>
            <div className="text-sm text-gray-600">Prospects</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Qualified</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">Proposal</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Closed Won</div>
          </div>
        </div>
      </div>
    </div>
  )
}
