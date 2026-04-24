import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Plus, Ticket } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Coupons — Admin' }

export default async function AdminCoupons() {
  const supabase = await createClient()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Coupons & Discounts</h1>
          <p className="text-sm text-gray-500">{coupons?.length ?? 0} coupons</p>
        </div>
      </div>

      <details className="bg-white rounded-2xl border border-gray-100 p-4 group">
        <summary className="list-none cursor-pointer flex items-center justify-between font-semibold text-[var(--primary)] outline-none">
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Create New Coupon</span>
        </summary>
        <form action={async (fd) => {
          'use server'
          const { createCoupon } = await import('@/app/admin/actions')
          await createCoupon(fd)
        }} className="mt-4 pt-4 border-t border-gray-100 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Coupon Code *</label>
            <input required name="code" type="text" className="w-full px-3 py-2 border rounded-xl text-sm uppercase" placeholder="e.g. WELCOME10" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input name="description" type="text" className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Brief description..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
            <select name="discount_type" className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount Value *</label>
            <input required name="discount_value" type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="e.g. 10" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
            <input name="min_order_amount" type="number" min="0" defaultValue="0" className="w-full px-3 py-2 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Usage Limit</label>
            <input name="usage_limit" type="number" min="1" className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Leave empty for ∞" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" defaultChecked className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm">Active & Valid</span>
            </label>
            <button type="submit" className="btn-brand px-5 py-2 rounded-xl text-sm font-semibold">Generate Coupon</button>
          </div>
        </form>
      </details>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {coupons?.map(coupon => {
          const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date()
          const isExhausted = coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit

          return (
            <div key={coupon.id} className={`bg-white rounded-2xl border p-5 relative overflow-hidden ${isExpired || isExhausted ? 'border-gray-200 opacity-60' : 'border-gray-100 hover:shadow-md'} transition-shadow`}>
              {/* Decorative dashes */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-50 rounded-full -ml-1.5 border border-gray-100" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-50 rounded-full -mr-1.5 border border-gray-100" />
              <div className="border-b border-dashed border-gray-200 pb-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ticket className="w-4 h-4 text-[var(--primary)]" />
                      <span className="font-mono font-bold text-lg text-[var(--charcoal)] tracking-wider">{coupon.code}</span>
                    </div>
                    <p className="text-xs text-gray-500">{coupon.description ?? 'No description'}</p>
                  </div>
                  {coupon.is_active && !isExpired && !isExhausted ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">Active</span>
                  ) : isExpired ? (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-semibold">Expired</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-semibold">Inactive</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-bold text-[var(--primary)]">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : formatPrice(coupon.discount_value)
                    } OFF
                  </span>
                </div>
                {coupon.min_order_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min. Order</span>
                    <span className="font-medium">{formatPrice(coupon.min_order_amount)}</span>
                  </div>
                )}
                {coupon.max_discount_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max. Discount</span>
                    <span className="font-medium">{formatPrice(coupon.max_discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Usage</span>
                  <span className="font-medium">
                    {coupon.usage_count} / {coupon.usage_limit ?? '∞'}
                  </span>
                </div>
                {coupon.valid_until && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expires</span>
                    <span className={`font-medium ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                      {new Date(coupon.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button className="flex-1 text-xs py-2 border border-gray-200 rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors font-medium">
                  Edit
                </button>
                <button className="flex-1 text-xs py-2 border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors font-medium">
                  {coupon.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {(!coupons || coupons.length === 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <p className="text-4xl mb-3">🎟️</p>
          <h3 className="font-bold text-[var(--charcoal)] mb-1">No coupons yet</h3>
          <p className="text-sm text-gray-400 mb-4">Create your first coupon to attract customers.</p>
          <button className="btn-brand px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      )}
    </div>
  )
}
