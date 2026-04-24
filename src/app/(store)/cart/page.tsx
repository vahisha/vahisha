import { createClient } from '@/lib/supabase/server'
import { getProductPrice, formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { updateCartItemQuantity, removeFromCart } from '@/lib/actions'
import CartSummary from '@/components/store/CartSummary'

export const metadata: Metadata = { title: 'Shopping Bag — VAHISHA' }

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-4">Your bag is empty</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Sign in to see your saved items and continue shopping the archives.</p>
        <Link href="/auth/login?redirect=/cart" className="btn-brand px-8 py-4 rounded-xl font-bold">
          Sign In
        </Link>
      </div>
    )
  }

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*),
      variant:product_variants(*)
    `)
    .eq('user_id', user.id)

  const subtotal = cartItems?.reduce((acc, item) => {
    const price = getProductPrice(item.product as any)
    return acc + (price * item.quantity)
  }, 0) || 0

  const shipping = subtotal > 499 ? 0 : 99
  const total = subtotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-10">Shopping Bag</h1>

      {!cartItems || cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
           <p className="text-gray-400 mb-6">Your bag is currently empty.</p>
           <Link href="/shop" className="btn-brand px-8 py-3 rounded-full font-bold">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const p = item.product as any
              const v = item.variant as any
              const price = getProductPrice(p)
              
              return (
                <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-100 last:border-0">
                  <div className="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                     <Image 
                        src={v?.image_url || p.images?.[0]?.url || '/placeholder.jpg'} 
                        alt={p.name} 
                        width={100} 
                        height={133} 
                        className="w-full h-full object-cover"
                     />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <Link href={`/product/${p.slug}`} className="font-bold text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors">
                        {p.name}
                      </Link>
                      <p className="font-bold text-[var(--charcoal)]">{formatPrice(price * item.quantity)}</p>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-4">{v?.size} / {v?.color}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9">
                        <form action={async () => {
                          'use server'
                          await updateCartItemQuantity(item.id, item.quantity - 1)
                        }}>
                          <button className="px-3 hover:bg-gray-50 transition-colors h-full text-gray-500">
                             <Minus className="w-3.5 h-3.5" />
                          </button>
                        </form>
                        <span className="px-4 text-sm font-bold border-x border-gray-200 flex items-center h-full tabular-nums">
                          {item.quantity}
                        </span>
                        <form action={async () => {
                          'use server'
                          await updateCartItemQuantity(item.id, item.quantity + 1)
                        }}>
                          <button className="px-3 hover:bg-gray-50 transition-colors h-full text-gray-500">
                             <Plus className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                      
                      <form action={async () => {
                        'use server'
                        await removeFromCart(item.id)
                      }}>
                        <button className="text-gray-300 hover:text-red-500 transition-colors p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary subtotal={subtotal} />
          </div>
        </div>
      )}
    </div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
