import { createClient } from '@/lib/supabase/server'
import { getProductPrice, formatPrice } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, CreditCard, ChevronRight, HelpCircle } from 'lucide-react'
import OrderTracker from '@/components/store/OrderTracker'
import OrderMap from '@/components/store/OrderMap'
import CopyButton from '@/components/store/CopyButton'

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/account/orders/' + id)
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back Button */}
      <Link 
        href="/account" 
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[var(--primary)] transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Orders
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-2">Order Details</h1>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })} • ID: #{order.order_number}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            suppressHydrationWarning
            className="text-xs font-bold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Need Help?
          </button>
        </div>
      </div>

      {/* Flipkart-Style Visual Tracker & Logistics Map */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden mb-8 shadow-sm">
        <div className="p-6 sm:p-8 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Delivery Status</h3>
          <OrderTracker currentStatus={order.status} />
        </div>
        
        {/* Interactive Map Tracking */}
        <div className="border-t border-gray-50">
           <OrderMap status={order.status} destinationCity={order.shipping_address?.city || 'Delhi'} />
        </div>
        
        {order.status === 'shipped' && order.tracking_number && (
          <div className="p-6 pt-0 sm:p-8 sm:pt-0">
             <div className="pt-8 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking Number</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold text-[var(--charcoal)]">{order.tracking_number}</p>
                    <CopyButton text={order.tracking_number} />
                  </div>
                </div>
                {order.estimated_delivery && (
                  <div className="sm:text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Delivery</p>
                    <p className="text-sm font-bold text-green-600">
                      {new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long'
                      })}
                    </p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Summary & Address */}
        <div className="md:col-span-2 space-y-8">
          {/* Items Section */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-bold text-[var(--charcoal)]">Shipment Details</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={item.product_image || '/placeholder.jpg'} 
                      alt={item.product_name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product_id}`} className="text-sm font-bold text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
                      {item.product_name}
                    </Link>
                    <div className="text-xs text-gray-400 mt-1 space-x-3">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <p className="text-sm font-bold text-[var(--charcoal)] mt-3">{formatPrice(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Shipping Address</h3>
              </div>
              <p className="text-sm font-bold text-[var(--charcoal)] mb-1">{order.shipping_address?.full_name}</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {order.shipping_address?.address_line1}, {order.shipping_address?.city}<br />
                {order.shipping_address?.state} - {order.shipping_address?.pincode}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium italic">Contact: {order.shipping_address?.phone}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Payment Info</h3>
              </div>
              <p className="text-sm font-bold text-[var(--charcoal)] mb-1 uppercase">{order.payment_method}</p>
              <p className="text-xs text-gray-500">Status: <span className="text-green-600 font-bold uppercase">{order.payment_status}</span></p>
              <div className="mt-4 pt-4 border-t border-gray-50">
                 <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Total Paid</p>
                 <p className="text-lg font-bold text-[var(--charcoal)]">{formatPrice(order.total_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions/Support */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-3xl p-6">
            <h4 className="text-sm font-bold text-[var(--charcoal)] mb-4">Order Summary</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Items Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping Fee</span>
                <span>{order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between text-sm font-bold text-[var(--charcoal)]">
                <span>Grand Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          <button 
            suppressHydrationWarning
            className="w-full bg-white border border-gray-200 py-4 rounded-2xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-between px-6"
          >
            Download Invoice
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  )
}
