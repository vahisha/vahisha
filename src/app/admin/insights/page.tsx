import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import type { Metadata } from 'next'
import { Eye, ShoppingCart, TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Insights & Behavior — Admin' }

export default async function AdminInsights() {
  const supabase = await createClient()

  // 1. Fetch Recent Product Views
  const { data: views } = await supabase
    .from('product_views')
    .select(`
      id,
      created_at,
      user_id,
      profiles ( full_name, email ),
      products ( name, slug, base_price, images:product_images(url, is_primary) )
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  // 2. Fetch Abandoned Carts (All items currently in carts)
  const { data: carts } = await supabase
    .from('cart_items')
    .select(`
      id,
      created_at,
      quantity,
      user_id,
      profiles ( full_name, email, phone ),
      products ( name, slug, base_price, images:product_images(url, is_primary) )
    `)
    .order('created_at', { ascending: false })

  // Group carts by user to show "Carts" instead of individual items
  const abandonedMap = new Map<string, { user: any, items: any[], totalValue: number, lastUpdate: string }>()
  
  carts?.forEach(item => {
    if (!item.profiles) return
    const uid = item.user_id
    if (!abandonedMap.has(uid)) {
      abandonedMap.set(uid, { user: item.profiles, items: [], totalValue: 0, lastUpdate: item.created_at })
    }
    const cart = abandonedMap.get(uid)!
    cart.items.push(item)
    // Safe typing since we fetch nested arrays
    const p = item.products as any
    cart.totalValue += (parseFloat(p?.base_price || '0') * item.quantity)
    if (new Date(item.created_at) > new Date(cart.lastUpdate)) {
      cart.lastUpdate = item.created_at
    }
  })

  const abandonedList = Array.from(abandonedMap.values()).sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Store Insights</h1>
        <p className="text-sm text-gray-500">Track user behavior and shopping cart intent in real-time.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Abandoned Carts */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--charcoal)]">Active & Abandoned Carts</h2>
              <p className="text-xs text-gray-500">Users who added items but have not checked out.</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[600px] p-5 space-y-4">
            {abandonedList.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">No items currently in any carts.</p>
            ) : (
              abandonedList.map(cart => (
                <div key={cart.user.email} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start justify-between mb-3 border-b border-gray-200 pb-3">
                    <div>
                      <p className="font-bold text-sm text-[var(--charcoal)]">{cart.user.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{cart.user.email}</p>
                      {cart.user.phone && <p className="text-xs text-gray-400">☎ {cart.user.phone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--primary)]">₹{cart.totalValue.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(cart.lastUpdate), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {cart.items.map(item => {
                       const p = item.products as any
                       const img = p?.images?.find((i: any) => i.is_primary)?.url || p?.images?.[0]?.url
                       return (
                         <div key={item.id} className="flex items-center gap-3">
                           {img ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={img} alt="Product" className="w-8 h-8 rounded object-cover" />
                           ) : (
                             <div className="w-8 h-8 bg-gray-200 rounded shrink-0" />
                           )}
                           <div className="flex-1 min-w-0">
                             <p className="text-xs font-semibold text-gray-700 truncate">{p?.name}</p>
                             <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                           </div>
                         </div>
                       )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Views */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--charcoal)]">Product View Stream</h2>
              <p className="text-xs text-gray-500">Most recent products actively viewed by registered users.</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {(!views || views.length === 0) ? (
              <p className="text-sm text-gray-500 text-center py-10">No views recorded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {views.map(view => {
                  const u = view.profiles as any
                  const p = view.products as any
                  const img = p?.images?.find((i: any) => i.is_primary)?.url || p?.images?.[0]?.url

                  return (
                    <li key={view.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                         {img && <img src={img} alt="img" className="w-full h-full object-cover" />}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm text-[var(--charcoal)] font-semibold truncate hover:text-[var(--primary)] cursor-pointer">
                           {p?.name}
                         </p>
                         <p className="text-xs text-gray-500 flex items-center gap-1">
                           <TrendingUp className="w-3 h-3" />
                           {u?.full_name || 'Unknown'} viewed this
                         </p>
                       </div>
                       <div className="text-right shrink-0">
                         <p className="text-[10px] text-gray-400 font-medium">
                           {formatDistanceToNow(new Date(view.created_at), { addSuffix: true })}
                         </p>
                       </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
