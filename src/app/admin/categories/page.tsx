import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Categories — Admin' }

export default async function AdminCategories() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')

  // Product counts per category
  const { data: products } = await supabase.from('products').select('category_id').eq('is_active', true)
  const countMap: Record<string, number> = {}
  products?.forEach(p => { if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Categories</h1>
          <p className="text-sm text-gray-500">{categories?.length ?? 0} categories</p>
        </div>
      </div>

      <details className="bg-white rounded-2xl border border-gray-100 p-4 group">
        <summary className="list-none cursor-pointer flex items-center justify-between font-semibold text-[var(--primary)] outline-none">
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Category</span>
        </summary>
        <form action={async (fd) => {
          'use server'
          const { createCategory } = await import('@/app/admin/actions')
          await createCategory(fd)
        }} className="mt-4 pt-4 border-t border-gray-100 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category Name *</label>
            <input required name="name" type="text" className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="e.g. Winter Wear" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
            <input name="image_url" type="url" className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input name="description" type="text" className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Brief description..." />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" defaultChecked className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm">Active (Visible)</span>
            </label>
            <button type="submit" className="btn-brand px-5 py-2 rounded-xl text-sm font-semibold">Create</button>
          </div>
        </form>
      </details>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            {cat.image_url && (
              <div className="relative h-32 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-bold">{cat.name}</h3>
                </div>
              </div>
            )}
            <div className="p-4">
              {!cat.image_url && <h3 className="font-bold text-[var(--charcoal)] mb-1">{cat.name}</h3>}
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description ?? 'No description'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    <span className="font-bold text-[var(--charcoal)]">{countMap[cat.id] ?? 0}</span> products
                  </span>
                  <span className="text-xs text-gray-500">Order: <span className="font-bold">{cat.display_order}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.is_active ? 'Active' : 'Hidden'}
                  </span>
                  <button className="text-xs text-[var(--primary)] hover:underline font-medium">Edit</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
