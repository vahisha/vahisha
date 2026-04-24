'use client'

import { useState } from 'react'
import { updateStock } from '@/app/admin/actions'
import { Check, X, Loader2 } from 'lucide-react'

interface QuickStockEditProps {
  variantId: string
  initialStock: number
}

export default function QuickStockEdit({ variantId, initialStock }: QuickStockEditProps) {
  const [stock, setStock] = useState(initialStock)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      await updateStock(variantId, stock)
      setIsEditing(false)
    } catch (err) {
      console.error('Update failed:', err)
      setStock(initialStock) // Reset on failure
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(parseInt(e.target.value) || 0)}
          className="w-16 px-2 py-1 text-xs border border-[var(--primary)] rounded outline-none focus:ring-1 focus:ring-[var(--primary)] text-center"
          autoFocus
        />
        <button 
          onClick={handleUpdate}
          disabled={isLoading}
          className="p-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button 
          onClick={() => { setIsEditing(false); setStock(initialStock); }}
          className="p-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={() => setIsEditing(true)}
      className={`text-sm font-bold px-3 py-1 rounded-lg border transition-all hover:border-[var(--primary)] hover:bg-pink-50 ${
        stock === 0 ? 'text-red-600 border-red-100 bg-red-50' :
        stock <= 5 ? 'text-amber-600 border-amber-100 bg-amber-50' :
        'text-green-700 border-green-100 bg-green-50'
      }`}
    >
      {stock} Qty
    </button>
  )
}
