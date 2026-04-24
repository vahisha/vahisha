import { Product, Coupon } from '@/types/database'

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getProductPrice(product: Product): number {
  return product.sale_price ?? product.base_price
}

export function getDiscountPercent(product: Product): number | null {
  if (!product.sale_price) return null
  return Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
}

export function getPrimaryImage(product: Product): string {
  const primary = product.images?.find(i => i.is_primary)
  return primary?.url ?? product.images?.[0]?.url ?? '/placeholder.jpg'
}

export function calculateOrderTotals(
  items: { unit_price: number; quantity: number }[],
  coupon: Coupon | null,
  shippingThreshold = 499,
  shippingCharge = 49,
) {
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  let discountAmount = 0

  if (coupon && subtotal >= coupon.min_order_amount) {
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_value) / 100
      if (coupon.max_discount_amount) {
        discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
      }
    } else {
      discountAmount = coupon.discount_value
    }
  }

  const afterDiscount = subtotal - discountAmount
  const shippingAmount = afterDiscount >= shippingThreshold ? 0 : shippingCharge
  const totalAmount = afterDiscount + shippingAmount

  return { subtotal, discountAmount, shippingAmount, totalAmount }
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
