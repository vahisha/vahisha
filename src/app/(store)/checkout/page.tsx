import { createClient } from '@/lib/supabase/server'
import { getProductPrice } from '@/lib/utils'
import { redirect } from 'next/navigation'
import CheckoutPage from '@/components/store/CheckoutPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { 
  title: 'Secure Checkout — VAHISHA',
  robots: 'noindex, nofollow' // Don't index checkout page
}

export default async function CheckoutRoute({ searchParams }: { searchParams: Promise<{ coupon?: string, discount?: string, cid?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/checkout')
  }

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*, images:product_images(*)),
      variant:product_variants(*)
    `)
    .eq('user_id', user.id)

  if (!cartItems || cartItems.length === 0) {
    redirect('/cart')
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = getProductPrice(item.product as any)
    return acc + (price * item.quantity)
  }, 0)

  const shipping = subtotal > 499 ? 0 : 99
  const discount = parseFloat(params.discount || '0')
  const total = Math.max(0, subtotal + shipping - discount)

  return (
    <CheckoutPage 
      cartItems={cartItems}
      subtotal={subtotal}
      shipping={shipping}
      discount={discount}
      total={total}
      couponId={params.cid}
      couponCode={params.coupon}
    />
  )
}
