'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { MessageSquare, CheckCircle, Truck, Package, XCircle, ChevronRight } from 'lucide-react'
import { updateOrderStatus } from '@/app/admin/actions'
import Link from 'next/link'

interface BulkOrderTableProps {
  initialOrders: any[]
  statusColors: Record<string, string>
}

export default function BulkOrderTable({ initialOrders, statusColors }: BulkOrderTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [orders, setOrders] = useState(initialOrders)
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(orders.map(o => o.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.length === 0) return
    setIsUpdating(true)
    
    try {
      const results = await Promise.all(
        selectedIds.map(id => updateOrderStatus(id, status))
      )
      
      if (results.every(r => r.success)) {
        // Optimistically update local state
        setOrders(prev => prev.map(o => 
          selectedIds.includes(o.id) ? { ...o, status } : o
        ))
        setSelectedIds([])
      }
    } catch (err) {
      console.error('Bulk update failed:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="bg-white border border-gray-100 overflow-hidden relative">
      {/* Bulk Action Bar (Sticky) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-50 bg-[var(--charcoal)] text-white px-6 py-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold bg-[var(--primary)] px-2 py-0.5 rounded text-white">{selectedIds.length}</span>
            <span className="text-sm font-medium">Orders Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleBulkUpdate('processing')}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-2"
            >
              <Package className="w-3.5 h-3.5" /> Processing
            </button>
            <button 
              onClick={() => handleBulkUpdate('shipped')}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-2"
            >
              <Truck className="w-3.5 h-3.5" /> Shipped
            </button>
            <button 
              onClick={() => handleBulkUpdate('delivered')}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Delivered
            </button>
            <div className="h-4 w-px bg-white/20 mx-2" />
            <button 
              onClick={() => setSelectedIds([])}
              className="text-white/60 hover:text-white text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full admin-table">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === orders.length && orders.length > 0} 
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
              </th>
              <th className="text-left px-6 py-4">Order #</th>
              <th className="text-left px-6 py-4">Customer</th>
              <th className="text-left px-6 py-4">Date</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-left px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr key={order.id} className={selectedIds.includes(order.id) ? 'bg-pink-50/30' : ''}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(order.id)}
                    onChange={() => toggleSelectOne(order.id)}
                    className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm font-bold text-[var(--primary)] hover:underline whitespace-nowrap">
                      {order.order_number}
                    </Link>
                    {order.notes && (
                      <div className="group relative">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {order.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[var(--charcoal)] truncate max-w-[150px]">
                    {order.user?.full_name ?? '—'}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{order.user?.email}</p>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-[var(--charcoal)]">{formatPrice(Number(order.total_amount))}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${statusColors[order.status] ?? 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline uppercase tracking-widest">
                    Manage <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
