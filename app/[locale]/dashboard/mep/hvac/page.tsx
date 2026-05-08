'use client'

import { useState, useEffect } from 'react'
import { InventoryItem, InventoryCategory } from '../../../types'
import { inventoryDb } from '../../../lib/db'

export default function MEPHVAC() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    const allItems = inventoryDb.getAll()
    const hvacItems = allItems.filter(item => item.category === 'HVAC')
    setItems(hvacItems)
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">HVAC Systems</h1>
          <p className="text-gray-500">Heating, Ventilation & Air Conditioning inventory</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search HVAC items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <span>➕</span> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  {item.subCategory && (
                    <span className="text-xs text-gray-500">{item.subCategory}</span>
                  )}
                </div>
                <span className="text-2xl">🌡️</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className="text-lg font-bold">{item.quantity} {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Min Stock</p>
                  <p className="text-sm font-medium">{item.minQuantity}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                💰 {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unitPrice)}/unit
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🏭</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No HVAC Items Yet</h3>
            <p className="text-gray-500">Start adding HVAC equipment and materials to your inventory.</p>
          </div>
        )}
      </div>
    </div>
  )
}
