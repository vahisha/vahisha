import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, ShoppingCart, Package, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reports — Admin' }

export default async function AdminReports() {
  const supabase = await createClient()

  const [
    { data: orders },
    { data: topProducts },
    { data: categoryData },
  ] = await Promise.all([
    supabase.from('orders')
      .select('total_amount, status, created_at, payment_method')
      .in('status', ['delivered', 'shipped', 'processing', 'confirmed']),
    supabase.from('products')
      .select('name, total_sold, base_price, sale_price, category:categories(name)')
      .order('total_sold', { ascending: false })
      .limit(10),
    supabase.from('categories')
      .select('id, name'),
  ])

  const totalRevenue = orders?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0
  const avgOrderValue = orders && orders.length > 0 ? totalRevenue / orders.length : 0

  // Payment method breakdown
  const paymentBreakdown: Record<string, number> = {}
  orders?.forEach(o => {
    paymentBreakdown[o.payment_method] = (paymentBreakdown[o.payment_method] ?? 0) + 1
  })

  // Monthly breakdown (last 6 months)
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
    const monthOrders = orders?.filter(o => {
      const od = new Date(o.created_at)
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
    }) ?? []
    const revenue = monthOrders.reduce((s, o) => s + Number(o.total_amount), 0)
    return { label, revenue, count: monthOrders.length }
  })

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Reports & Analytics</h1>
        <p className="text-sm text-gray-500">Business performance overview</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: 'Total Revenue',    value: formatPrice(totalRevenue),          color: 'from-[var(--primary)] to-[var(--primary-light)]' },
          { icon: ShoppingCart, label: 'Total Orders',   value: (orders?.length ?? 0).toString(),   color: 'from-purple-500 to-purple-400' },
          { icon: Package, label: 'Avg. Order Value',    value: formatPrice(avgOrderValue),         color: 'from-blue-500 to-blue-400' },
          { icon: Users, label: 'Paid Orders',           value: (orders?.filter(o => o.status === 'delivered').length ?? 0).toString(), color: 'from-green-500 to-green-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-bold text-[var(--charcoal)]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-[var(--charcoal)] mb-6">Monthly Revenue</h2>
          <div className="space-y-3">
            {monthlyData.map(m => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-14 shrink-0 font-medium">{m.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-end pr-2 transition-all duration-700"
                    style={{ width: `${(m.revenue / maxRevenue) * 100}%`, minWidth: m.revenue > 0 ? '2rem' : '0' }}
                  >
                    {m.revenue > 0 && <span className="text-white text-xs font-bold">₹{(m.revenue / 1000).toFixed(0)}k</span>}
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-12 shrink-0 text-right">{m.count} orders</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-[var(--charcoal)] mb-6">Payment Methods</h2>
          {Object.keys(paymentBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(paymentBreakdown).map(([method, count]) => (
                <div key={method} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 uppercase font-medium">{method.toUpperCase()}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]"
                      style={{ width: `${(count / (orders?.length ?? 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--charcoal)] w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No order data yet</p>
          )}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50">
          <h2 className="font-bold text-[var(--charcoal)]">Top Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="text-left px-6 py-4">Rank</th>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Units Sold</th>
                <th className="text-left px-6 py-4">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts?.map((p, i) => (
                <tr key={p.name}>
                  <td className="px-6 py-3.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-gray-200 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-sm font-semibold text-[var(--charcoal)]">{p.name}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-gray-500">{(p.category as { name?: string })?.name ?? '—'}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-bold">{formatPrice(Number(p.sale_price ?? p.base_price))}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-bold text-[var(--charcoal)]">{p.total_sold}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-bold text-green-600">
                      {formatPrice(p.total_sold * Number(p.sale_price ?? p.base_price))}
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
