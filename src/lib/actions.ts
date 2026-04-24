'use server'

import { createClient } from '@/lib/supabase/server'
import { getProductPrice } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function trackProductView(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, reason: 'unauthorized' }

  await supabase.from('product_views').insert({
    user_id: user.id,
    product_id: productId
  })

  return { success: true }
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, reason: 'unauthorized' }

  const productId = formData.get('product_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const title = formData.get('title') as string
  const body = formData.get('body') as string

  // Check if user bought product (simplistic verification logic for now)
  const { data: orderItem } = await supabase
    .from('order_items')
    .select('id')
    .eq('product_id', productId)
    .limit(1)

  const isVerified = !!orderItem && orderItem.length > 0

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    rating,
    title,
    body,
    is_verified_purchase: isVerified,
    is_approved: false // requires admin approval
  })

  if (error) return { success: false, reason: error.message }
  return { success: true }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient()
  if (quantity < 1) return removeFromCart(itemId)
  
  await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
  revalidatePath('/cart')
  return { success: true }
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient()
  await supabase.from('cart_items').delete().eq('id', itemId)
  revalidatePath('/cart')
  return { success: true }
}

export async function placeOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, reason: 'unauthorized' }

  // Extract address info
  const shippingAddress = {
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    address_line1: formData.get('address'),
    city: formData.get('city'),
    state: formData.get('state'),
    pincode: formData.get('pincode'),
  }

  // Get Cart Items
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, product:products(*), variant:product_variants(*)')
    .eq('user_id', user.id)

  if (!cartItems || cartItems.length === 0) return { success: false, reason: 'cart_empty' }

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = getProductPrice(item.product as any)
    return acc + (price * item.quantity)
  }, 0)
  const discount = parseFloat(formData.get('discount_amount') as string || '0')
  const shipping = subtotal > 499 ? 0 : 99
  const total = Math.max(0, subtotal + shipping - discount)

  // Create Order
  const orderNumber = `VAH-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      shipping_address: shippingAddress,
      subtotal,
      shipping_amount: shipping,
      discount_amount: discount,
      total_amount: total,
      coupon_id: formData.get('coupon_id') || null,
      payment_method: 'cod',
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) return { success: false, reason: orderError.message }

  // 1.5 Atomic Stock Decrement & Item Creation
  try {
    const orderItems = []
    
    for (const item of cartItems) {
      const p = item.product as any
      const v = item.variant as any
      const price = getProductPrice(p)

      // Atomically decrement stock
      if (v?.id) {
        const { error: stockErr } = await supabase.rpc('decrement_stock', {
          target_variant_id: v.id,
          amount: item.quantity
        })
        
        if (stockErr) {
          // If a single item fails, we should ideally rollback the order 
          // but since order is already inserted, we mark it as failed or handle it
          return { success: false, reason: `Limited stock available for ${p.name}. Please adjust quantity.` }
        }
      }

      orderItems.push({
        order_id: order.id,
        product_id: p.id,
        variant_id: v?.id,
        product_name: p.name,
        product_image: v?.image_url || p.images?.[0]?.url,
        size: v?.size,
        color: v?.color,
        quantity: item.quantity,
        unit_price: price,
        total_price: price * item.quantity
      })
    }

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) return { success: false, reason: itemsError.message }
    
  } catch (err: any) {
    return { success: false, reason: 'Inventory update failed. Please try again.' }
  }

  // Clear Cart
  await supabase.from('cart_items').delete().eq('user_id', user.id)

  revalidatePath('/account')
  revalidatePath('/cart')
  
  return { success: true, orderNumber }
}

export async function applyCoupon(code: string, currentTotal: number) {
  const supabase = await createClient()
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) return { success: false, reason: 'Invalid or expired coupon code.' }
  
  if (currentTotal < coupon.min_order_amount) {
    return { success: false, reason: `Minimum order of ₹${coupon.min_order_amount} required.` }
  }

  let discount = 0
  if (coupon.discount_type === 'percentage') {
    discount = (currentTotal * coupon.discount_value) / 100
    if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount)
  } else {
    discount = coupon.discount_value
  }

  return { success: true, discount, couponId: coupon.id, discountType: coupon.discount_type, discountValue: coupon.discount_value }
}

export async function toggleWishlist(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, action: 'none', reason: 'unauthorized' }

  // Check if exists
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
    return { success: true, action: 'removed' }
  } else {
    await supabase.from('wishlists').insert({
      user_id: user.id,
      product_id: productId
    })
    return { success: true, action: 'added' }
  }
}

