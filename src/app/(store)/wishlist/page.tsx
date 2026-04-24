import { createClient } from '@/lib/supabase/server'
import { getProductPrice, formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { HeartCrack, ShoppingBag } from 'lucide-react'
import type { Metadata } from 'next'
import WishlistButton from '@/components/store/WishlistButton'

export const metadata: Metadata = { title: 'My Wishlist' }

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-4">My Wishlist</h1>
        <p className="text-gray-500 mb-8">Please log in to view your saved items.</p>
        <Link href="/login?redirect=/wishlist" className="btn-brand px-6 py-3 rounded-xl font-bold">
          Log In or Create Account
        </Link>
      </div>
    )
  }

  const { data: wishlists } = await supabase
    .from('wishlists')
    .select(`
      id,
      products (*, images:product_images(*))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-8">My Wishlist</h1>

      {!wishlists || wishlists.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <HeartCrack className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--charcoal)] mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Save the items you love by clicking the heart icon. Start exploring our collections to find your new favorites.
          </p>
          <Link href="/shop" className="btn-brand px-6 py-3 rounded-full font-bold">
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlists.map((w) => {
            const product = w.products as any
            if (!product) return null
            const price = getProductPrice(product)
            const primaryImage = product.images?.find((i: any) => i.is_primary) ?? product.images?.[0]

            return (
              <div key={w.id} className="group relative">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
                  <Link href={`/product/${product.slug}`}>
                    <Image
                      src={primaryImage?.url ?? '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </Link>

                  {/* Absolute positioning for wishlist button */}
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistButton productId={product.id} initialIsWished={true} />
                  </div>
                </div>

                <Link href={`/product/${product.slug}`} className="block">
                  <h3 className="text-sm font-medium text-[var(--charcoal)] group-hover:text-[var(--primary)] transition-colors line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[var(--charcoal)]">
                      {formatPrice(price)}
                    </p>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
