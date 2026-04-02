'use client'

import { useState, useEffect } from 'react'
import { InventoryItem, InventoryCategory, PurchaseOrder } from '../../types'
import { inventoryDb, seedDataDb } from '../../lib/db'
import * as XLSX from 'xlsx'

const categoryOptions: InventoryCategory[] = [
  'HVAC', 'Electrical', 'Plumbing', 'ELV', 'Fire Protection', 'Gas System',
  'Concrete & Cement', 'Steel & Metal', 'Wood & Timber', 'Roofing',
  'Doors & Windows', 'Tiles & Flooring', 'Paint & Coating', 'Insulation',
  'Sand & Aggregate', 'Bricks & Blocks', 'Glass & Glazing', 'Hardware & Fasteners',
  'Plumbing Fixtures', 'Tools', 'Safety', 'Other'
]
const unitOptions = ['pieces', 'meters', 'liters', 'kg', 'boxes', 'sets', 'rolls', 'bags', 'sheets', 'm²', 'm³', 'buckets', 'set']

const categoryColors: Record<InventoryCategory, string> = {
  HVAC: 'bg-blue-100 text-blue-800',
  Electrical: 'bg-yellow-100 text-yellow-800',
  Plumbing: 'bg-green-100 text-green-800',
  ELV: 'bg-purple-100 text-purple-800',
  'Fire Protection': 'bg-red-100 text-red-800',
  'Gas System': 'bg-orange-100 text-orange-800',
  'Concrete & Cement': 'bg-stone-100 text-stone-800',
  'Steel & Metal': 'bg-slate-100 text-slate-800',
  'Wood & Timber': 'bg-amber-100 text-amber-800',
  Roofing: 'bg-teal-100 text-teal-800',
  'Doors & Windows': 'bg-cyan-100 text-cyan-800',
  'Tiles & Flooring': 'bg-lime-100 text-lime-800',
  'Paint & Coating': 'bg-pink-100 text-pink-800',
  Insulation: 'bg-indigo-100 text-indigo-800',
  'Sand & Aggregate': 'bg-yellow-50 text-yellow-700',
  'Bricks & Blocks': 'bg-red-50 text-red-700',
  'Glass & Glazing': 'bg-sky-100 text-sky-800',
  'Hardware & Fasteners': 'bg-gray-100 text-gray-800',
  'Plumbing Fixtures': 'bg-emerald-100 text-emerald-800',
  Tools: 'bg-orange-100 text-orange-800',
  Safety: 'bg-red-100 text-red-800',
  Other: 'bg-gray-100 text-gray-800'
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [view, setView] = useState<'inventory' | 'purchase'>('inventory')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<InventoryCategory | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [seeding, setSeeding] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: '' as InventoryCategory,
    description: '',
    quantity: 0,
    unit: 'pieces',
    minQuantity: 0,
    unitPrice: 0,
    supplier: '',
    location: ''
  })

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = () => {
    setItems(inventoryDb.getAll())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const itemData = {
      ...form,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      unitPrice: Number(form.unitPrice)
    }
    
    if (editingItem) {
      inventoryDb.update(editingItem.id, itemData)
    } else {
      inventoryDb.create(itemData as any)
    }
    loadItems()
    resetForm()
  }

  const resetForm = () => {
    setForm({
      name: '',
      category: '' as InventoryCategory,
      description: '',
      quantity: 0,
      unit: 'pieces',
      minQuantity: 0,
      unitPrice: 0,
      supplier: '',
      location: ''
    })
    setShowForm(false)
    setEditingItem(null)
  }

  const handleEdit = (item: InventoryItem) => {
    setForm({
      name: item.name,
      category: item.category,
      description: item.description || '',
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.minQuantity,
      unitPrice: item.unitPrice,
      supplier: item.supplier || '',
      location: item.location || ''
    })
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      inventoryDb.delete(id)
      loadItems()
    }
  }

  const exportToExcel = () => {
    const exportData = items.map(item => ({
      'Item Name': item.name || '',
      'Category': item.category || '',
      'Description': item.description || '',
      'Quantity': item.quantity || 0,
      'Unit': item.unit || '',
      'Min Stock': item.minQuantity || 0,
      'Unit Price': item.unitPrice || 0,
      'Total Value': (item.quantity || 0) * (item.unitPrice || 0),
      'Supplier': item.supplier || '',
      'Location': item.location || '',
      'Last Restocked': item.lastRestocked || ''
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory')
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Item Name
      { wch: 12 }, // Category
      { wch: 30 }, // Description
      { wch: 10 }, // Quantity
      { wch: 10 }, // Unit
      { wch: 10 }, // Min Stock
      { wch: 12 }, // Unit Price
      { wch: 15 }, // Total Value
      { wch: 20 }, // Supplier
      { wch: 20 }, // Location
      { wch: 15 }  // Last Restocked
    ]

    XLSX.writeFile(wb, `inventory-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const updateQuantity = (id: string, change: number) => {
    const item = items.find(i => i.id === id)
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change)
      inventoryDb.updateQuantity(id, newQuantity)
      loadItems()
    }
  }

  const filteredItems = items.filter(i => {
    const matchesCategory = filterCategory === 'all' || i.category === filterCategory
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const lowStockItems = items.filter(i => i.minQuantity > 0 && i.quantity < i.minQuantity)

  const handleSeedData = async () => {
    setSeeding(true)
    const count = seedDataDb.seedAll()
    setSeeding(false)
    if (count > 0) {
      loadItems()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // Category summary
  const categorySummary = categoryOptions.map(cat => ({
    category: cat,
    count: items.filter(i => i.category === cat).length,
    totalValue: items.filter(i => i.category === cat).reduce((sum, i) => sum + ((i.quantity || 0) * (i.unitPrice || 0)), 0)
  }))

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory & Materials</h1>
          <p className="text-gray-500">Manage materials, tools, and supplies</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('inventory')}
            className={`px-4 py-2 rounded-lg ${view === 'inventory' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Inventory
          </button>
          <button
            onClick={() => setView('purchase')}
            className={`px-4 py-2 rounded-lg ${view === 'purchase' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Purchase Orders
          </button>
        </div>
      </div>

      {view === 'inventory' ? (
        <>
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Low Stock Alert</h3>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <span key={item.id} className="bg-white px-3 py-1 rounded text-sm">
                    {item.name}: {item.quantity}/{item.minQuantity} {item.unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as InventoryCategory | 'all')}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                📥 Export Excel
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Item
              </button>
              {items.length === 0 && (
                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {seeding ? 'Loading...' : ' Load Sample Data'}
                </button>
              )}
            </div>
          </div>

          {/* Category Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {categorySummary.map(cat => (
              <div key={cat.category} className="bg-white rounded-lg p-3 shadow text-center">
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${categoryColors[cat.category as InventoryCategory]}`}>
                  {cat.category}
                </div>
                <div className="text-xl font-bold mt-1">{cat.count}</div>
                <div className="text-xs text-gray-500">{formatCurrency(cat.totalValue)}</div>
              </div>
            ))}
          </div>

          {/* Item Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                    <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Item Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category *</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value as InventoryCategory })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          required
                        >
                          <option value="">Select Category</option>
                          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantity *</label>
                        <input
                          type="number"
                          value={form.quantity}
                          onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Unit *</label>
                        <select
                          value={form.unit}
                          onChange={(e) => setForm({ ...form, unit: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Min Stock Level</label>
                        <input
                          type="number"
                          value={form.minQuantity}
                          onChange={(e) => setForm({ ...form, minQuantity: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          placeholder="Alert when below"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Unit Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.unitPrice}
                          onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Supplier</label>
                        <input
                          type="text"
                          value={form.supplier}
                          onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Storage Location</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        placeholder="e.g., Warehouse A, Shelf B3"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </button>
                      <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const isLowStock = item.minQuantity > 0 && item.quantity < item.minQuantity
              return (
                <div key={item.id} className={`bg-white rounded-xl shadow p-6 ${isLowStock ? 'border-2 border-red-300' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                    </div>
                    {isLowStock && <span className="text-red-500">⚠️</span>}
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className={`font-medium ${isLowStock ? 'text-red-600' : ''}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unit Price:</span>
                      <span>{formatCurrency(item.unitPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Value:</span>
                      <span className="font-medium">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</span>
                    </div>
                    {item.supplier && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Supplier:</span>
                        <span>{item.supplier}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-blue-50 text-blue-600 py-1 rounded hover:bg-blue-100 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-50 text-red-600 py-1 rounded hover:bg-red-100 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700">No items found</h3>
              <p className="text-gray-500">Add your first inventory item</p>
            </div>
          )}
        </>
      ) : (
        // Purchase Orders View
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-700">Purchase Orders</h3>
          <p className="text-gray-500">Create and manage purchase orders</p>
          <p className="text-sm text-gray-400 mt-4">Coming soon...</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{items.length}</div>
          <div className="text-gray-500 text-sm">Total Items</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
          <div className="text-gray-500 text-sm">Low Stock</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(items.reduce((sum, i) => sum + ((i.quantity || 0) * (i.unitPrice || 0)), 0))}</div>
          <div className="text-gray-500 text-sm">Total Value</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-600">{items.reduce((sum, i) => sum + i.quantity, 0)}</div>
          <div className="text-gray-500 text-sm">Total Units</div>
        </div>
      </div>
    </div>
  )
}
