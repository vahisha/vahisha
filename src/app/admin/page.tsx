import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Package, Users, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, Tag, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: recentOrders },
    { data: lowStockVariants },
    { data: topProducts },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('product_variants')
      .select('*, product:products(name)')
      .in('stock_status', ['low_stock', 'out_of_stock'])
      .order('stock_quantity')
      .limit(6),
    supabase.from('products')
      .select('name, total_sold, base_price, sale_price')
      .order('total_sold', { ascending: false })
      .limit(5),
  ])

  // Calculate revenue from orders
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .in('status', ['delivered', 'shipped', 'processing', 'confirmed'])

  const totalRevenue = revenueData?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0

  // Calculate Today's vs Yesterday's Revenue
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const todayRevenue = revenueData?.filter(o => o.created_at.startsWith(todayStr))
    .reduce((s, o) => s + Number(o.total_amount), 0) ?? 0
  const yesterdayRevenue = revenueData?.filter(o => o.created_at.startsWith(yesterdayStr))
    .reduce((s, o) => s + Number(o.total_amount), 0) ?? 0

  const revDiff = todayRevenue - yesterdayRevenue
  const revPercent = yesterdayRevenue > 0 ? (revDiff / yesterdayRevenue) * 100 : 0

  // Monthly revenue (last 6 months stub for chart)
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
  const monthlyRevenue = [28000, 42000, 38000, 55000, 48000, totalRevenue > 0 ? totalRevenue : 62000]
  const maxRev = Math.max(...monthlyRevenue)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with VAHISHA today.</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            icon: TrendingUp,
            label: 'Total Revenue',
            value: formatPrice(totalRevenue),
            change: '+12.5%',
            up: true,
            color: 'from-[var(--primary)] to-[var(--primary-light)]',
            bg: 'bg-pink-50',
          },
          {
            icon: ShoppingCart,
            label: 'Total Orders',
            value: totalOrders?.toLocaleString() ?? '0',
            change: '+8.2%',
            up: true,
            color: 'from-purple-500 to-purple-400',
            bg: 'bg-purple-50',
          },
          {
            icon: Package,
            label: 'Active Products',
            value: totalProducts?.toLocaleString() ?? '0',
            change: '+3',
            up: true,
            color: 'from-blue-500 to-blue-400',
            bg: 'bg-blue-50',
          },
          {
            icon: Users,
            label: 'Customers',
            value: totalCustomers?.toLocaleString() ?? '0',
            change: '+24 this week',
            up: true,
            color: 'from-green-500 to-green-400',
            bg: 'bg-green-50',
          },
        ].map(({ icon: Icon, label, value, change, up, color, bg }) => (
          <div key={label} className="stat-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
                {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {change}
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--charcoal)] mb-1">{value}</p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-[var(--charcoal)]">Revenue Overview</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {months.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[var(--primary)] to-[var(--primary-light)] opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ height: `${(monthlyRevenue[i] / maxRev) * 100}%`, minHeight: '4px' }}
                  title={formatPrice(monthlyRevenue[i])}
                />
                <span className="text-xs text-gray-400 font-medium">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--charcoal)] mb-4 flex items-center gap-2 uppercase tracking-widest">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/products/new" className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 hover:border-[var(--primary)] hover:bg-pink-50 transition-all group">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-400 group-hover:text-[var(--primary)]" />
                  <span className="text-sm font-bold text-gray-700">Add Product</span>
                </div>
                <Plus className="w-4 h-4 text-gray-300" />
              </Link>
              <Link href="/admin/coupons" className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 hover:border-[var(--primary)] hover:bg-pink-50 transition-all group">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-gray-400 group-hover:text-[var(--primary)]" />
                  <span className="text-sm font-bold text-gray-700">New Coupon</span>
                </div>
                <Plus className="w-4 h-4 text-gray-300" />
              </Link>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] p-6 border border-gray-800 shadow-sm text-white">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
              Monthly Goal
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">₹1.5L Revenue</span>
                <span className="text-white/50">45%</span>
              </div>
              <div className="h-1.5 bg-white/10 overflow-hidden">
                <div className="h-full bg-[var(--primary)] w-[45%] shadow-[0_0_10px_rgba(231,70,148,0.5)]" />
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                You've reached 45% of your ₹150,000 monthly target. Keep pushing!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-[var(--charcoal)]">Recent Orders</h2>
            <a href="/admin/orders" className="text-xs text-[var(--primary)] hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm px-6">
            <div className={`flex items-center gap-0.5 font-bold ${revDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revDiff >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(revPercent).toFixed(1)}%
            </div>
            <span className="text-gray-400">vs yesterday</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th className="text-left px-6 py-3">Order</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders?.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <a href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-[var(--primary)] hover:underline">
                        {order.order_number}
                      </a>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-sm text-[var(--charcoal)]">
                        {(order.user as { full_name?: string; email?: string })?.full_name || (order.user as { email?: string })?.email || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-bold">{formatPrice(Number(order.total_amount))}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                      No orders yet. They&apos;ll appear here once customers start shopping!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-[var(--charcoal)]">Low Stock Alerts</h2>
          </div>
          <div className="space-y-3">
            {lowStockVariants?.map(v => {
              const isOut = v.stock_status === 'out_of_stock'
              return (
                <div key={v.id} className={`flex items-center gap-2 p-3 ${isOut ? 'bg-red-50' : 'bg-amber-50'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--charcoal)] truncate">
                      {(v.product as { name?: string })?.name}
                    </p>
                    <p className="text-xs text-gray-500">{v.size} / {v.color}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${isOut ? 'text-red-600' : 'text-amber-600'}`}>
                    {isOut ? 'Out of Stock' : `${v.stock_quantity} left`}
                  </span>
                </div>
              )
            })}
            {(!lowStockVariants || lowStockVariants.length === 0) && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
                </div>
                <p className="text-sm text-gray-400">All stock levels look good!</p>
              </div>
            )}
          </div>
          {lowStockVariants && lowStockVariants.length > 0 && (
            <a href="/admin/inventory" className="block mt-4 text-center text-xs text-[var(--primary)] hover:underline font-medium">
              Manage Inventory
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
