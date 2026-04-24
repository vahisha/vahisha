import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, getProductPrice, getDiscountPercent } from '@/lib/utils'
import { ShoppingBag, Heart, Star, Truck, RotateCcw, Shield, ChevronRight, ShieldCheck } from 'lucide-react'
import Breadcrumbs from '@/components/store/Breadcrumbs'
import AddToCartButton from '@/components/store/AddToCartButton'
import ProductViewTracker from '@/components/store/ProductViewTracker'
import ReviewForm from '@/components/store/ReviewForm'
import WishlistButton from '@/components/store/WishlistButton'
import VariantSelector from '@/components/store/VariantSelector'
import WhatsAppButton from '@/components/store/WhatsAppButton'
import ShareButton from '@/components/store/ShareButton'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('name, short_description').eq('slug', slug).single()
  return {
    title: data?.name ?? 'Product',
    description: data?.short_description ?? '',
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`*, category:categories(*), images:product_images(*), variants:product_variants(*)`)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const price = getProductPrice(product)
  const discount = getDiscountPercent(product)
  const primaryImage = product.images?.find((i: { is_primary: boolean }) => i.is_primary) ?? product.images?.[0]

  // Get unique sizes and colors
  const sizes = [...new Set(product.variants?.map((v: { size: string }) => v.size) ?? [])]
  const colors = product.variants
    ? Array.from(new Map<string, { color: string; hex: string }>(
        product.variants.map((v: { color: string; color_hex: string }) => [v.color, { color: v.color, hex: v.color_hex }])
      ).values())
    : []

  // Related products
  const { data: related } = await supabase
    .from('products')
    .select(`*, category:categories(*), images:product_images(*), variants:product_variants(*)`)
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  // Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, title, body, created_at, user:profiles(full_name)')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  const averageRating = reviews?.length 
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length 
    : 0

  // Check if Wishlisted
  const { data: { user } } = await supabase.auth.getUser()
  const { data: wishlistQuery } = user ? await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product.id)
    .single() : { data: null }
  
  const isWished = !!wishlistQuery
  
  // Estimated Delivery (5-7 days logic)
  const today = new Date()
  const early = new Date()
  early.setDate(today.getDate() + 5)
  const late = new Date()
  late.setDate(today.getDate() + 7)

  const deliveryStr = `${early.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${late.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`

  // Total Stock for Urgency
  const totalStock = (product.variants as any[])?.reduce((s: number, v: any) => s + (v.stock_quantity || 0), 0) || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductViewTracker productId={product.id} />
      {/* Breadcrumb */}
      <Breadcrumbs />

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={primaryImage?.url ?? '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discount && (
              <span className="absolute top-4 left-4 badge-sale text-white text-sm font-bold px-3 py-1.5 rounded-full">
                -{discount}% OFF
              </span>
            )}
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              <ShareButton 
                title={product.name} 
                text={`Check out this ${product.name} at VAHISHA!`} 
                url={`https://vahisha.com/product/${product.slug}`} 
              />
              <button 
                suppressHydrationWarning
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-pink-50 transition-colors"
              >
                <Heart className="w-5 h-5 text-[var(--primary)]" />
              </button>
            </div>
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: { id: string; url: string; alt_text: string }) => (
                <div key={img.id} className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 border-transparent hover:border-[var(--primary)] transition-colors cursor-pointer">
                  <Image src={img.url} alt={img.alt_text ?? ''} fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-sm text-[var(--primary)] font-semibold uppercase tracking-wider hover:underline"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--charcoal)] mb-2">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <a href="#reviews" className="text-xs text-gray-500 hover:text-[var(--primary)] font-medium">
              {reviews?.length ?? 0} Review{(reviews?.length !== 1) ? 's' : ''}
            </a>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-[var(--charcoal)]">{formatPrice(price)}</span>
            {product.sale_price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.base_price)}</span>
                <span className="badge-sale text-white text-sm font-bold px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">{product.short_description}</p>

          <VariantSelector product={product} />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WhatsAppButton 
              productName={product.name} 
              productUrl={`https://vahisha.com/product/${product.slug}`} 
            />
            <div className="flex flex-col gap-2">
              <WishlistButton 
                productId={product.id} 
                initialIsWished={isWished} 
                className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--primary)] transition-colors h-14 border border-gray-100 rounded-2xl"
              />
            </div>
          </div>

          {/* Enhanced Logistics & Trust Section */}
          <div className="bg-gray-50 rounded-2xl p-6 mt-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--charcoal)]">Estimated Delivery</p>
                <p className="text-sm text-green-600 font-bold">{deliveryStr}</p>
              </div>
            </div>
            
            {totalStock > 0 && totalStock <= 5 && (
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest leading-none">Hurry! Only {totalStock} unit{totalStock > 1 ? 's' : ''} left in stock</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gray-400" />
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Product details accordion */}
          <div className="mt-6 space-y-3">
            {product.description && (
              <details className="group border border-gray-100 rounded-xl">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-[var(--charcoal)]">
                  Product Description
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </details>
            )}
            {product.fabric && (
              <details className="group border border-gray-100 rounded-xl">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-semibold text-[var(--charcoal)]">
                  Fabric & Care
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Fabric:</span> {product.fabric}</p>
                  {product.care_instructions && <p><span className="font-medium">Care:</span> {product.care_instructions}</p>}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section id="reviews" className="mt-16 pt-16 border-t border-gray-100 grid lg:grid-cols-2 gap-12">
        <div>
           <h2 className="text-2xl font-bold font-serif text-[var(--charcoal)] mb-6">Customer Reviews</h2>
           
           {!reviews || reviews.length === 0 ? (
             <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
           ) : (
             <div className="space-y-6">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-gray-100 pb-6">
                     <div className="flex items-center gap-1 mb-2">
                       {[1, 2, 3, 4, 5].map(star => (
                         <Star key={star} className={`w-3 h-3 ${star <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                       ))}
                     </div>
                     <h4 className="font-bold text-sm text-[var(--charcoal)] mb-1">{r.title}</h4>
                     <p className="text-sm text-gray-600 mb-2">{r.body}</p>
                     <p className="text-xs text-gray-400 font-medium">
                       — {(r.user as {full_name?: string})?.full_name || 'Verified Buyer'} on {new Date(r.created_at).toLocaleDateString('en-IN')}
                     </p>
                  </div>
                ))}
             </div>
           )}
        </div>
        <div>
           <ReviewForm productId={product.id} />
        </div>
      </section>

      {/* Related Products */}
      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold font-serif text-[var(--charcoal)] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <Image
                    src={p.images?.[0]?.url ?? '/placeholder.jpg'}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
                <h3 className="text-sm font-medium text-[var(--charcoal)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-sm font-bold text-[var(--charcoal)] mt-0.5">
                  {formatPrice(getProductPrice(p))}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
