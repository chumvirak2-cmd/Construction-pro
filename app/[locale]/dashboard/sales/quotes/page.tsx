'use client'

import { useState } from 'react'

export default function SalesQuotes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quotations</h1>
          <p className="text-gray-500">Create and manage client quotations</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>📄</span> New Quote
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Quote Generator</h3>
        <p className="text-gray-500">
          Create professional quotations linked to projects and BOQs.
        </p>
      </div>
    </div>
  )
}
