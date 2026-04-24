import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import { SlidersHorizontal, Search } from 'lucide-react'
import Breadcrumbs from '@/components/store/Breadcrumbs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop All',
  description: 'Browse our full collection of premium women\'s clothing — kurtis, dresses, tops, co-ords, ethnic wear and more.',
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Bestsellers', value: 'bestseller' },
]

interface SearchParams {
  category?: string
  filter?: string
  minPrice?: string
  maxPrice?: string
  size?: string
  sort?: string
  q?: string
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let selectStr = `*, category:categories(*), images:product_images(*), variants:product_variants(*)`
  if (params.size) {
    selectStr = `*, category:categories(*), images:product_images(*), variants:product_variants!inner(*)`
  }

  let query = supabase
    .from('products')
    .select(selectStr)
    .eq('is_active', true)

  if (params.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.filter === 'new') query = query.eq('is_new_arrival', true)
  if (params.filter === 'bestseller') query = query.eq('is_bestseller', true)
  if (params.filter === 'featured') query = query.eq('is_featured', true)

  if (params.minPrice) query = query.gte('base_price', parseFloat(params.minPrice))
  if (params.maxPrice) query = query.lte('base_price', parseFloat(params.maxPrice))
  if (params.q) query = query.ilike('name', `%${params.q}%`)
  
  if (params.size) {
    query = query.eq('product_variants.size', params.size)
  }

  if (params.sort === 'price_asc') query = query.order('base_price', { ascending: true })
  else if (params.sort === 'price_desc') query = query.order('base_price', { ascending: false })
  else if (params.sort === 'bestseller') query = query.order('total_sold', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: products } = await query.limit(48)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--charcoal)]">
            {params.category
              ? categories?.find(c => c.slug === params.category)?.name ?? 'Collection'
              : params.filter === 'new' ? 'New Arrivals'
              : params.filter === 'bestseller' ? 'Bestsellers'
              : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {products?.length ?? 0} products found
          </p>
        </div>

        <div className="flex gap-3">
          {/* Search */}
          <form className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 bg-white">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              name="q"
              defaultValue={params.q}
              suppressHydrationWarning
              placeholder="Search products..."
              className="text-sm outline-none bg-transparent w-40"
            />
          </form>

          {/* Sort */}
          <select
            name="sort"
            defaultValue={params.sort ?? 'newest'}
            suppressHydrationWarning
            className="border border-gray-200 rounded-full px-4 py-2 text-sm bg-white outline-none cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm text-[var(--charcoal)] mb-3 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Categories
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/shop"
                    className={`text-sm block py-1.5 px-3 rounded-lg transition-colors ${
                      !params.category ? 'bg-pink-50 text-[var(--primary)] font-medium' : 'text-gray-600 hover:text-[var(--primary)]'
                    }`}
                  >
                    All Categories
                  </a>
                </li>
                {categories?.map(cat => (
                  <li key={cat.id}>
                    <a
                      href={`/shop?category=${cat.slug}`}
                      className={`text-sm block py-1.5 px-3 rounded-lg transition-colors ${
                        params.category === cat.slug
                          ? 'bg-pink-50 text-[var(--primary)] font-medium'
                          : 'text-gray-600 hover:text-[var(--primary)]'
                      }`}
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-sm text-[var(--charcoal)] mb-3 uppercase tracking-wider">
                Price Range
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Under ₹499', min: '', max: '499' },
                  { label: '₹499 - ₹999', min: '499', max: '999' },
                  { label: '₹999 - ₹1499', min: '999', max: '1499' },
                  { label: 'Above ₹1499', min: '1499', max: '' },
                ].map(r => (
                  <a
                    key={r.label}
                    href={`/shop?${params.category ? `category=${params.category}&` : ''}minPrice=${r.min}&maxPrice=${r.max}`}
                    className="text-sm block py-1.5 px-3 rounded-lg text-gray-600 hover:text-[var(--primary)] hover:bg-pink-50 transition-colors"
                  >
                    {r.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="font-semibold text-sm text-[var(--charcoal)] mb-3 uppercase tracking-wider">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <a
                    key={s}
                    href={`/shop?size=${s}${params.category ? `&category=${params.category}` : ''}`}
                    className={`text-xs px-3 py-1.5 border rounded-full transition-colors ${
                      params.size === s
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)]'
                    }`}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Filter tags */}
            <div>
              <h3 className="font-semibold text-sm text-[var(--charcoal)] mb-3 uppercase tracking-wider">Quick Filters</h3>
              <div className="space-y-2">
                {[
                  { label: '🆕 New Arrivals', filter: 'new' },
                  { label: '⭐ Bestsellers', filter: 'bestseller' },
                  { label: '✨ Featured', filter: 'featured' },
                ].map(f => (
                  <a
                    key={f.filter}
                    href={`/shop?filter=${f.filter}`}
                    className={`text-sm block py-1.5 px-3 rounded-lg transition-colors ${
                      params.filter === f.filter
                        ? 'bg-pink-50 text-[var(--primary)] font-medium'
                        : 'text-gray-600 hover:text-[var(--primary)]'
                    }`}
                  >
                    {f.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">👗</div>
              <h3 className="text-xl font-bold font-serif text-[var(--charcoal)] mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or browse all categories.</p>
              <a href="/shop" className="btn-brand px-6 py-3 rounded-full text-sm">
                Clear Filters
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
