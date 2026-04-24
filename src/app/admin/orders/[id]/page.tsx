import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Package, MapPin, CreditCard, 
  User, CalendarDays, Hash, AlertCircle,
  CheckCircle2, Clock, Truck, Home, Ban
} from 'lucide-react'
import { updateOrderStatus } from '@/app/admin/actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Order — Admin' }

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700 border-green-200',    icon: Home },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700 border-red-200',          icon: Ban },
}

export default async function AdminManageOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      user:profiles(full_name, email, phone),
      items:order_items(*)
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const currentConfig = statusConfig[order.status] ?? statusConfig.pending
  const StatusIcon = currentConfig.icon

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">
              #{order.order_number}
            </h1>
            <p className="text-sm text-gray-500">
              Placed {new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${currentConfig.color}`}>
          <StatusIcon className="w-4 h-4" />
          {currentConfig.label}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Items & Fulfillment */}
        <div className="lg:col-span-2 space-y-6">

          {/* Items List */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-[var(--charcoal)]">Order Items</h2>
              <span className="ml-auto text-xs text-gray-400">{order.items?.length ?? 0} item(s)</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--charcoal)] mb-1">{item.product_name}</p>
                    <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                      {item.size && <span className="bg-gray-100 px-2 py-0.5 rounded-full">Size: {item.size}</span>}
                      {item.color && <span className="bg-gray-100 px-2 py-0.5 rounded-full">Color: {item.color}</span>}
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full">Qty: {item.quantity}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      ₹{item.unit_price} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-[var(--charcoal)] shrink-0">
                    {formatPrice(item.total_price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--charcoal)] pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Update Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-[var(--charcoal)]">Update Fulfillment Status</h2>
            </div>
            <div className="p-6">
              <form action={async (fd) => {
                'use server'
                await updateOrderStatus(id, fd.get('status') as string)
              }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {ALL_STATUSES.map((s) => {
                    const cfg = statusConfig[s]
                    const Icon = cfg.icon
                    return (
                      <label key={s} className="cursor-pointer">
                        <input type="radio" name="status" value={s} defaultChecked={order.status === s} className="sr-only peer" />
                        <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center peer-checked:border-[var(--primary)] peer-checked:bg-pink-50 border-gray-200 hover:border-gray-300`}>
                          <Icon className={`w-5 h-5 ${order.status === s ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
                          <span className="text-xs font-bold text-gray-600">{cfg.label}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="w-full btn-brand py-3 rounded-xl font-bold text-sm"
                >
                  Update Order Status
                </button>
              </form>
            </div>
          </div>

          {/* Tracking Info */}
          {(order.tracking_number || order.estimated_delivery) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-[var(--charcoal)] mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" /> Logistics Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {order.tracking_number && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tracking Number</p>
                    <p className="text-sm font-bold text-[var(--charcoal)] mt-1">{order.tracking_number}</p>
                  </div>
                )}
                {order.estimated_delivery && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estimated Delivery</p>
                    <p className="text-sm font-bold text-green-600 mt-1">
                      {new Date(order.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Customer & Shipping */}
        <div className="space-y-6">

          {/* Payment Status Card */}
          <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
            order.payment_status === 'paid' 
              ? 'bg-green-50 border-green-100' 
              : 'bg-yellow-50 border-yellow-100'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.payment_status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <CreditCard className={`w-5 h-5 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Payment</p>
              <p className={`text-sm font-bold uppercase ${order.payment_status === 'paid' ? 'text-green-700' : 'text-yellow-700'}`}>
                {order.payment_status} • {order.payment_method?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Customer</h3>
            </div>
            <p className="text-sm font-bold text-[var(--charcoal)] mb-1">
              {(order.user as any)?.full_name || 'N/A'}
            </p>
            <p className="text-xs text-gray-500">{(order.user as any)?.email}</p>
            {(order.user as any)?.phone && (
              <p className="text-xs text-gray-500 mt-1">{(order.user as any)?.phone}</p>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping Address</h3>
            </div>
            <p className="text-sm font-bold text-[var(--charcoal)] mb-2">{order.shipping_address?.full_name}</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {order.shipping_address?.address_line1}<br />
              {order.shipping_address?.city}, {order.shipping_address?.state}<br />
              {order.shipping_address?.pincode}
            </p>
            <p className="text-xs text-gray-500 mt-3 font-medium">📞 {order.shipping_address?.phone}</p>
          </div>

          {/* Order Meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Metadata</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-gray-400 uppercase font-bold tracking-wider">Order ID</p>
                <p className="text-gray-600 font-mono mt-0.5 break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase font-bold tracking-wider">Created</p>
                <p className="text-gray-600 mt-0.5 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {new Date(order.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              {order.notes && (
                <div>
                  <p className="text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Customer Note
                  </p>
                  <p className="text-gray-600 mt-0.5 bg-yellow-50 p-2 rounded-lg">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-3">
            <a 
              href={`/admin/orders/${id}/label`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 text-sm font-bold bg-[var(--charcoal)] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              🖨️ Print Shipping Label
            </a>
            <Link 
              href={`/admin/orders`} 
              className="w-full text-center py-2.5 text-xs font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
            >
              ← All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
