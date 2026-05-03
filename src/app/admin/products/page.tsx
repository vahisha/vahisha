import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Products — Admin' }

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`*, category:categories(name), images:product_images(url, is_primary)`)
    .order('created_at', { ascending: false })

  if (params.q) query = query.ilike('name', `%${params.q}%`)
  if (params.category) query = query.eq('category_id', params.category)

  const { data: products } = await query
  const { data: categories } = await supabase.from('categories').select('id, name').order('name')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Products</h1>
          <p className="text-sm text-gray-500">{products?.length ?? 0} total products</p>
        </div>
        <a
          href="/admin/products/new"
          className="flex items-center gap-2 btn-brand px-5 py-2.5 rounded-xl text-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <form className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 flex-1 bg-gray-50">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search products..."
            className="text-sm outline-none bg-transparent flex-1"
          />
        </form>
        <select
          name="category"
          defaultValue={params.category}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none bg-gray-50 cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories?.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Sold</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products?.map(product => {
                const img = product.images?.find((i: { is_primary: boolean }) => i.is_primary) ?? product.images?.[0]
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {img && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--charcoal)] max-w-xs truncate">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.sku ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {(product.category as { name?: string })?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-[var(--charcoal)]">
                          {formatPrice(product.sale_price ?? product.base_price)}
                        </p>
                        {product.sale_price && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.base_price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{product.total_sold}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.is_active ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Active</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">Draft</span>
                        )}
                        {product.is_featured && <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700 font-semibold">Featured</span>}
                        {product.is_new_arrival && <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">New</span>}
                        {product.is_bestseller && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">Best</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[var(--primary)] hover:bg-pink-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </a>
                        <a
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View on store"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {(!products || products.length === 0) && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📦</p>
              <h3 className="font-bold text-[var(--charcoal)] mb-1">No products found</h3>
              <p className="text-sm text-gray-400 mb-4">Add your first product to get started.</p>
              <a href="/admin/products/new" className="btn-brand px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
