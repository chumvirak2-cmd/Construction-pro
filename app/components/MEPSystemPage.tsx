'use client'

import { useState, useEffect } from 'react'
import { InventoryItem, InventoryCategory } from '../types'
import { inventoryDb } from '../lib/db'

const categoryStyles: Record<string, { border: string; icon: string; description: string }> = {
  HVAC: { border: 'border-blue-500', icon: '🌡️', description: 'Heating, Ventilation & Air Conditioning inventory' },
  Electrical: { border: 'border-yellow-500', icon: '⚡', description: 'Electrical equipment, wiring, and components' },
  Plumbing: { border: 'border-green-500', icon: '🚰', description: 'Plumbing fixtures, piping, and valves' },
  ELV: { border: 'border-purple-500', icon: '📶', description: 'Extra Low Voltage systems and cabling' },
  'Fire Protection': { border: 'border-red-500', icon: '🔥', description: 'Fire protection equipment and safety supplies' },
  'Gas System': { border: 'border-orange-500', icon: '⛽', description: 'Gas system equipment and piping' },
  'Solar/Energy': { border: 'border-yellow-500', icon: '☀️', description: 'Solar energy modules and supporting components' },
  'BMS/Controls': { border: 'border-indigo-500', icon: '🧠', description: 'Building management systems and controls' },
  'Lift & Escalator': { border: 'border-slate-500', icon: '🛗', description: 'Lift and escalator systems and accessories' },
  'Concrete & Cement': { border: 'border-stone-500', icon: '🧱', description: 'Concrete, cement and masonry materials' },
  'Steel & Metal': { border: 'border-slate-500', icon: '🔧', description: 'Steel and metal building materials' },
  Wood: { border: 'border-amber-500', icon: '🪵', description: 'Wood and timber supplies' },
  Roofing: { border: 'border-teal-500', icon: '🏠', description: 'Roofing materials and accessories' },
  'Doors & Windows': { border: 'border-cyan-500', icon: '🚪', description: 'Doors, windows and hardware' },
  'Tiles & Flooring': { border: 'border-lime-500', icon: '🧱', description: 'Tiles, flooring and surface finishes' },
  'Paint & Coating': { border: 'border-pink-500', icon: '🎨', description: 'Paints, coatings and finishing products' },
  Insulation: { border: 'border-indigo-500', icon: '🧊', description: 'Insulation products for thermal control' },
  'Sand & Aggregate': { border: 'border-yellow-500', icon: '🏖️', description: 'Sand, aggregate and earth materials' },
  'Bricks & Blocks': { border: 'border-red-500', icon: '🧱', description: 'Bricks, blocks and masonry components' },
  'Glass & Glazing': { border: 'border-sky-500', icon: '🪟', description: 'Glass panels and glazing systems' },
  'Hardware & Fasteners': { border: 'border-gray-500', icon: '🔩', description: 'Hardware and fastening supplies' },
  'Plumbing Fixtures': { border: 'border-emerald-500', icon: '🚿', description: 'Plumbing fixtures and fittings' },
  Tools: { border: 'border-orange-500', icon: '🔧', description: 'Tools and equipment for construction work' },
  Safety: { border: 'border-red-500', icon: '🦺', description: 'Safety equipment and protective gear' },
  Other: { border: 'border-gray-500', icon: '📦', description: 'Other inventory items' }
}

type MEPItemForm = Omit<InventoryItem, 'id' | 'createdAt' | 'subCategory'> & { subCategory?: string }

interface MEPSystemPageProps {
  title: string
  category: InventoryCategory
  headerId?: string
}

export default function MEPSystemPage({ title, category, headerId }: MEPSystemPageProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState<MEPItemForm>({
    name: '',
    category,
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
    const allItems = inventoryDb.getAll()
    const categoryItems = allItems.filter(item => item.category === category)
    setItems(categoryItems)
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setForm({
      name: '',
      category,
      description: '',
      quantity: 0,
      unit: 'pieces',
      minQuantity: 0,
      unitPrice: 0,
      supplier: '',
      location: ''
    })
    setEditingItem(null)
    setShowForm(false)
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
      inventoryDb.update(editingItem.id, itemData as Partial<InventoryItem>)
    } else {
      inventoryDb.create(itemData as any)
    }

    loadItems()
    resetForm()
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
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
    setShowForm(true)
  }

  const styles = categoryStyles[category] || categoryStyles.Other

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500">{styles.description}</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span> Add Item
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 p-2 min-h-[44px] min-w-[44px]">✕</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
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
                    <label className="block text-sm font-medium mb-1">Sub Category</label>
                    <input
                      type="text"
                      value={form.subCategory || ''}
                      onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="Optional sub category"
                    />
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
                      min="0"
                      value={form.quantity || ''}
                      onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
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
                      <option value="pieces">pieces</option>
                      <option value="meters">meters</option>
                      <option value="liters">liters</option>
                      <option value="kg">kg</option>
                      <option value="boxes">boxes</option>
                      <option value="sets">sets</option>
                      <option value="rolls">rolls</option>
                      <option value="bags">bags</option>
                      <option value="sheets">sheets</option>
                      <option value="m²">m²</option>
                      <option value="m³">m³</option>
                      <option value="buckets">buckets</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Stock Level</label>
                    <input
                      type="number"
                      value={form.minQuantity || ''}
                      onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
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
                      value={form.unitPrice || ''}
                      onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Supplier</label>
                    <input
                      type="text"
                      value={form.supplier || ''}
                      onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={form.location || ''}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="e.g., Warehouse A, Shelf B3"
                  />
                </div>

                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <button type="submit" className="bg-blue-600 text-white px-4 md:px-6 py-2.5 rounded-lg hover:bg-blue-700 min-h-[44px]">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 md:px-6 py-2.5 rounded-lg min-h-[44px]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm p-4 ${styles.border}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  {item.subCategory && (
                    <span className="text-xs text-gray-500">{item.subCategory}</span>
                  )}
                </div>
                <span className="text-2xl">{styles.icon}</span>
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
            <div className="text-6xl mb-4">{styles.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No {title} Yet</h3>
            <p className="text-gray-500">Start adding items to this MEP category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
