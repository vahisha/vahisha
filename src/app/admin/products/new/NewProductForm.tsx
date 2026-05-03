'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export default function NewProductForm() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])

  // Form State
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [desc, setDesc] = useState('')
  const [fabric, setFabric] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [supabase])

  const slugify = (text: string) => text.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const slug = slugify(name)
    const productData = {
      name,
      slug,
      sku: sku || null,
      category_id: categoryId || null,
      base_price: parseFloat(basePrice),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      short_description: shortDesc,
      description: desc,
      fabric: fabric || null,
      is_active: isActive
    }

    const { error } = await supabase.from('products').insert(productData)
    setLoading(false)

    if (error) {
      showToast('Error saving product: ' + error.message, 'error')
    } else {
      showToast('Product created successfully', 'success')
      router.push('/admin/products')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Add New Product</h1>
            <p className="text-sm text-gray-500">Create a new product listing for your store.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all" placeholder="e.g. Floral Bloom Kurti" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all" placeholder="e.g. VH-KUR-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all bg-white">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
              <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} required rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all" placeholder="Brief summary for the product card..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all" placeholder="Detailed product description..." />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Pricing & Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (₹) *</label>
                <input type="number" min="0" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sale Price (₹)</label>
                <input type="number" min="0" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all" placeholder="0.00 (Optional)" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fabric Material</label>
                <input type="text" value={fabric} onChange={e => setFabric(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all" placeholder="e.g. 100% Cotton" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Publishing</h2>
            
            <div className="flex items-center gap-3">
              <div onClick={() => setIsActive(!isActive)} className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isActive ? 'bg-[var(--primary)]' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isActive ? 'left-5.5' : 'left-0.5'}`} style={{ left: isActive ? '22px' : '2px' }} />
              </div>
              <span className="text-sm font-medium text-gray-700">{isActive ? 'Active (Visible)' : 'Draft (Hidden)'}</span>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-brand py-3 rounded-xl flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Product
            </button>
          </div>

          {/* Image Placeholder Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-[var(--charcoal)]">Product Images & Variants</p>
            <p className="text-xs text-gray-500 mt-2">After saving the basic product details, you will be able to upload images and add size/color variants from the Edit Product page.</p>
          </div>
        </div>
      </form>
    </div>
  )
}
