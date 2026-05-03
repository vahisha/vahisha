export type UserRole = 'customer' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet'
export type DiscountType = 'percentage' | 'flat'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  category_id: string | null
  base_price: number
  sale_price: number | null
  cost_price: number | null
  sku: string | null
  tags: string[]
  fabric: string | null
  care_instructions: string | null
  is_active: boolean
  is_featured: boolean
  is_new_arrival: boolean
  is_bestseller: boolean
  meta_title: string | null
  meta_description: string | null
  total_sold: number
  average_rating: number | null
  review_count: number
  created_at: string
  updated_at: string
  // joined
  category?: Category
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  color_hex: string | null
  price_adjustment: number
  stock_quantity: number
  low_stock_threshold: number
  stock_status: StockStatus
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  label: string
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: DiscountType
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  usage_count: number
  per_user_limit: number
  is_active: boolean
  valid_from: string
  valid_until: string | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  created_at: string
  updated_at: string
  // joined
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  address_id: string | null
  shipping_address: Record<string, unknown>
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  payment_reference: string | null
  subtotal: number
  discount_amount: number
  shipping_amount: number
  total_amount: number
  coupon_id: string | null
  coupon_code: string | null
  notes: string | null
  tracking_number: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
  // joined
  items?: OrderItem[]
  user?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  product_image: string | null
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id: string | null
  rating: number
  title: string | null
  body: string | null
  is_approved: boolean
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  user?: Profile
}

export interface StoreSetting {
  key: string
  value: unknown
  updated_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}
