import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Package, MapPin, User, LogOut, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Account' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-4">My Account</h1>
        <p className="text-gray-500 mb-8">Please log in to view your orders and account details.</p>
        <Link href="/login" className="btn-brand px-6 py-3 rounded-xl font-bold">
          Log In securely
        </Link>
      </div>
    )
  }

  const [
    { data: profile },
    { data: orders }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)]">My Account</h1>
        <form action="/auth/signout" method="post">
          <button type="submit" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-bold text-[var(--charcoal)]">{profile?.full_name || 'Customer'}</h2>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
            <Link href="/wishlist" className="block text-sm font-semibold text-[var(--charcoal)] hover:text-[var(--primary)]">
              My Wishlist
            </Link>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-medium">Have an issue?</p>
              <a href="mailto:support@vahisha.com" className="text-sm font-semibold text-[var(--primary)] hover:underline">
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold font-serif text-[var(--charcoal)] mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--primary)]" /> Order History
          </h2>

          {!orders || orders.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-[var(--charcoal)] font-semibold mb-1">No orders yet</p>
              <p className="text-sm text-gray-500 mb-4">When you place an order, it will appear here.</p>
              <Link href="/shop" className="btn-brand px-6 py-2 rounded-full text-sm font-bold">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-6">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Order #{order.order_number}</p>
                      <p className="text-sm font-bold text-[var(--charcoal)]">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex flex-col sm:items-end gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                      >
                        Track Order <ChevronRight className="w-3 h-3" />
                      </Link>
                      <p className="text-sm font-bold text-[var(--charcoal)] mt-1">{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                          {item.product_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300"/></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.product_id}`} className="text-sm font-bold text-[var(--charcoal)] truncate hover:text-[var(--primary)] transition-colors">
                            {item.product_name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1 flex gap-2">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-700 shrink-0">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-start gap-2">
                     <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                     <p className="text-xs text-gray-500 leading-relaxed">
                       Delivered to <span className="font-semibold text-gray-700">{order.shipping_address?.full_name}</span> at {order.shipping_address?.address_line1}, {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
                     </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
