import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Search, Filter, MessageSquare, ShoppingCart, Package } from 'lucide-react'
import BulkOrderTable from '@/components/admin/BulkOrderTable'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Orders — Admin' }

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-500',
}

interface SearchParams { status?: string; q?: string }

export default async function AdminOrders({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, user:profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  
  if (params.q) {
    // Advanced 'or' filter for order_number or customer metadata
    query = query.or(`order_number.ilike.%${params.q}%,notes.ilike.%${params.q}%`)
  }

  const { data: orders } = await query.limit(50)

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Orders</h1>
          <p className="text-sm text-gray-500">{orders?.length ?? 0} orders found</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <a
          href="/admin/orders"
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !params.status ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-500 hover:text-[var(--primary)] border border-gray-200'
          }`}
        >
          All Orders
        </a>
        {statuses.map(s => (
          <a
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors ${
              params.status === s ? 'bg-[var(--primary)] text-white' : 'bg-white text-gray-500 hover:text-[var(--primary)] border border-gray-200'
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <form className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input 
            name="q" 
            defaultValue={params.q} 
            suppressHydrationWarning
            placeholder="Search order number..." 
            className="text-sm outline-none bg-transparent flex-1" 
          />
          {params.status && <input type="hidden" name="status" value={params.status} />}
        </form>
      </div>

      {/* Interactive Bulk Table */}
      <BulkOrderTable 
        initialOrders={orders ?? []} 
        statusColors={statusColors} 
      />
      
      {(!orders || orders.length === 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
          </div>
          <h3 className="font-bold text-[var(--charcoal)] mb-1">No orders yet</h3>
          <p className="text-sm text-gray-400">Orders will appear here once customers start buying.</p>
        </div>
      )}
    </div>
  )
}
