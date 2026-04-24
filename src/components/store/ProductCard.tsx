'use client'

import WishlistButton from '@/components/store/WishlistButton'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Star } from 'lucide-react'
import { Product } from '@/types/database'
import { formatPrice, getProductPrice, getDiscountPercent, getPrimaryImage } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  initialIsWished?: boolean
}

export default function ProductCard({ product, initialIsWished = false }: ProductCardProps) {
  const price = getProductPrice(product)
  const discount = getDiscountPercent(product)
  const image = getPrimaryImage(product)
  
  // Calculate dynamic rating from product data if available, otherwise fallback to a clean look
  const avgRating = product.average_rating ? Number(product.average_rating) : 0
  const reviewCount = product.review_count || 0

  return (
    <div className="product-card bg-white overflow-hidden group relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Image */}
      <div className="product-image relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount && (
            <span className="badge-sale text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {product.is_new_arrival && (
            <span className="badge-new text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              NEW
            </span>
          )}
          {product.is_bestseller && (
            <span className="badge-best text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              BEST
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-90 group-hover:scale-100 duration-300">
          <WishlistButton 
            productId={product.id} 
            initialIsWished={initialIsWished} 
          />
        </div>

        {/* Quick add visibility logic improved */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center justify-center gap-2 bg-[var(--charcoal)] text-white py-4 text-xs font-bold hover:bg-[var(--primary)] transition-colors tracking-widest uppercase"
          >
            <ShoppingBag className="w-4 h-4" />
            Quick View
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          {product.category && (
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest shrink-0">
              {product.category.name}
            </p>
          )}
          
          {/* Real Rating stars */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md">
              <Star className="w-2.5 h-2.5 fill-[var(--gold)] text-[var(--gold)]" />
              <span className="text-[10px] font-bold text-[var(--charcoal)]">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-[var(--charcoal)] text-sm leading-tight mb-2 hover:text-[var(--primary)] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Price & Review Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[var(--charcoal)]">
              {formatPrice(price)}
            </span>
            {product.sale_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.base_price)}
              </span>
            )}
          </div>
          
          {reviewCount > 0 && (
            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
              {reviewCount} review{reviewCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
