import { createClient } from '@/lib/supabase/server'
import { AlertTriangle, Package } from 'lucide-react'
import QuickStockEdit from '@/components/admin/QuickStockEdit'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Inventory — Admin' }

export default async function AdminInventory() {
  const supabase = await createClient()

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*, product:products(name, sku)')
    .order('stock_quantity', { ascending: true })

  const outOfStock = variants?.filter(v => v.stock_status === 'out_of_stock') ?? []
  const lowStock   = variants?.filter(v => v.stock_status === 'low_stock') ?? []
  const inStock    = variants?.filter(v => v.stock_status === 'in_stock') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Inventory</h1>
        <p className="text-sm text-gray-500">{variants?.length ?? 0} variants tracked</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm font-semibold text-red-700">Out of Stock</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{outOfStock.length}</p>
          <p className="text-xs text-red-500 mt-1">Variants need restocking</p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-amber-700">Low Stock</span>
          </div>
          <p className="text-3xl font-bold text-amber-700">{lowStock.length}</p>
          <p className="text-xs text-amber-500 mt-1">Variants running low</p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700">In Stock</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{inStock.length}</p>
          <p className="text-xs text-green-500 mt-1">Variants well stocked</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h2 className="font-bold text-[var(--charcoal)]">All Variants</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">SKU</th>
                <th className="text-left px-6 py-4">Variant</th>
                <th className="text-left px-6 py-4">Stock</th>
                <th className="text-left px-6 py-4">Threshold</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {variants?.map(v => (
                <tr key={v.id} className={v.stock_status === 'out_of_stock' ? 'bg-red-50/30' : v.stock_status === 'low_stock' ? 'bg-amber-50/30' : ''}>
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-semibold text-[var(--charcoal)] max-w-xs truncate">
                      {(v.product as { name?: string })?.name ?? '—'}
                    </p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-xs text-gray-400 font-mono">{(v.product as { sku?: string })?.sku ?? '—'}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      {v.color_hex && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
                          style={{ backgroundColor: v.color_hex }}
                        />
                      )}
                      <span className="text-sm text-gray-600">{v.size} / {v.color}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <QuickStockEdit variantId={v.id} initialStock={v.stock_quantity ?? 0} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-gray-500">{v.low_stock_threshold}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      v.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' :
                      v.stock_status === 'low_stock' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {v.stock_status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
