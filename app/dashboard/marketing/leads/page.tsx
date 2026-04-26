'use client'

import { useState } from 'react'

export default function MarketingLeads() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
          <p className="text-gray-500">Track and manage potential customers</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>👤</span> Add Lead
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Lead Management</h3>
        <p className="text-gray-500 mb-4">
          Capture and nurture leads from marketing campaigns.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">New Leads</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Converted</div>
          </div>
        </div>
      </div>
    </div>
  )
}
