'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStoreSettings(formData: FormData) {
  const supabase = await createClient()

  // Extract regular fields
  const get = (k: string) => formData.get(k)?.toString() || ''
  
  const updates = [
    { key: 'store_name', value: `"${get('store_name')}"` },
    { key: 'store_tagline', value: `"${get('store_tagline')}"` },
    { key: 'store_email', value: `"${get('store_email')}"` },
    { key: 'store_phone', value: `"${get('store_phone')}"` },
    { key: 'store_address', value: `"${get('store_address')}"` },
    { key: 'free_shipping_above', value: get('free_shipping_above') },
    { key: 'shipping_charge', value: get('shipping_charge') },
    { key: 'gst_percentage', value: get('gst_percentage') },
    { key: 'return_policy_days', value: get('return_policy_days') },
    { 
      key: 'announcement_bar', 
      value: JSON.stringify({
        enabled: formData.get('announcement_enabled') === 'on',
        text: get('announcement_text')
      })
    },
    {
      key: 'social_links',
      value: JSON.stringify({
        instagram: get('instagram'),
        facebook: get('facebook'),
        pinterest: get('pinterest')
      })
    }
  ]

  for (const item of updates) {
    if (item.value) {
      await supabase.from('store_settings').upsert({
        key: item.key,
        value: JSON.parse(item.value) // the value column is JSONB
      }, { onConflict: 'key' })
    }
  }

  revalidatePath('/', 'layout')
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  
  // 1. Get current order state to determine stock actions
  const { data: order } = await supabase
    .from('orders')
    .select('status, items:order_items(variant_id, quantity)')
    .eq('id', orderId)
    .single()

  if (!order) return { success: false, reason: 'order_not_found' }

  const oldStatus = order.status
  const newStatus = status

  // 2. Logic for Restocking / Destocking
  // We restock if moving TO cancelled/refunded FROM a live status
  const isNowCancelled = ['cancelled', 'refunded'].includes(newStatus)
  const wasCancelled = ['cancelled', 'refunded'].includes(oldStatus)

  if (isNowCancelled && !wasCancelled) {
    // Restock
    for (const item of (order.items as any[])) {
      if (item.variant_id) {
        await supabase.rpc('increment_stock', { target_variant_id: item.variant_id, amount: item.quantity })
      }
    }
  } else if (!isNowCancelled && wasCancelled) {
    // Re-decrement stock (moving back to live)
    for (const item of (order.items as any[])) {
      if (item.variant_id) {
        await supabase.rpc('decrement_stock', { target_variant_id: item.variant_id, amount: item.quantity })
      }
    }
  }

  // 3. Update the order
  await supabase.from('orders').update({ status }).eq('id', orderId)
  
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/account')
  
  return { success: true }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '')

  await supabase.from('categories').insert({
    name,
    slug,
    description: formData.get('description'),
    image_url: formData.get('image_url') || null,
    is_active: formData.get('is_active') === 'on'
  })

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function createCoupon(formData: FormData) {
  const supabase = await createClient()
  
  await supabase.from('coupons').insert({
    code: (formData.get('code') as string).toUpperCase(),
    description: formData.get('description'),
    discount_type: formData.get('discount_type'),
    discount_value: parseFloat(formData.get('discount_value') as string),
    min_order_amount: parseFloat(formData.get('min_order_amount') as string || '0'),
    usage_limit: formData.get('usage_limit') ? parseInt(formData.get('usage_limit') as string) : null,
    is_active: formData.get('is_active') === 'on'
  })

  revalidatePath('/admin/coupons')
  return { success: true }
}

export async function toggleReviewApproval(reviewId: string, isApproved: boolean) {
  const supabase = await createClient()
  
  // Get product slug for revalidation
  const { data: review } = await supabase
    .from('reviews')
    .select('product:products(slug)')
    .eq('id', reviewId)
    .single()

  await supabase.from('reviews').update({ is_approved: isApproved }).eq('id', reviewId)
  
  revalidatePath('/admin/reviews')
  if (review?.product) {
    // @ts-ignore
    revalidatePath(`/product/${review.product.slug}`)
  }
  
  return { success: true }
}
export async function updateStock(variantId: string, quantity: number) {
  const supabase = await createClient()
  
  // Calculate status based on new quantity (simplified mapping)
  // Usually this would be based on threshold, but let's assume a default of 5 for low stock
  let status = 'in_stock'
  if (quantity === 0) status = 'out_of_stock'
  else if (quantity <= 5) status = 'low_stock'

  await supabase.from('product_variants').update({ 
    stock_quantity: quantity,
    stock_status: status
  }).eq('id', variantId)
  
  revalidatePath('/admin/inventory')
  revalidatePath('/admin/products')
  return { success: true }
}
