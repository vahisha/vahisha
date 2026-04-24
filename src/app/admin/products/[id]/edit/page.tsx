'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export default function EditProductPage() {
   const router = useRouter()
   const params = useParams()
   const productId = params.id as string
   const supabase = createClient()
   const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])

  // Basic Info State
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [basePrice, setBasePrice] = useState('0')
  const [salePrice, setSalePrice] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [desc, setDesc] = useState('')
  const [fabric, setFabric] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isNewArrival, setIsNewArrival] = useState(false)
  const [isBestseller, setIsBestseller] = useState(false)

  // Images & Variants State
  const [images, setImages] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const { data: cats } = await supabase.from('categories').select('id, name').order('name')
      if (cats) setCategories(cats)

      const { data: product, error } = await supabase.from('products').select('*').eq('id', productId).single()
      if (error) {
        showToast('Failed to load product', 'error')
        router.push('/admin/products')
        return
      }

      setName(product.name || '')
      setSku(product.sku || '')
      setCategoryId(product.category_id || '')
      setBasePrice(product.base_price?.toString() || '0')
      setSalePrice(product.sale_price?.toString() || '')
      setShortDesc(product.short_description || '')
      setDesc(product.description || '')
      setFabric(product.fabric || '')
      setIsActive(product.is_active ?? true)
      setIsFeatured(product.is_featured ?? false)
      setIsNewArrival(product.is_new_arrival ?? false)
      setIsBestseller(product.is_bestseller ?? false)
      
      const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', productId).order('display_order')
      if (imgs) setImages(imgs)

      const { data: vars } = await supabase.from('product_variants').select('*').eq('product_id', productId)
      if (vars) setVariants(vars)

      setLoading(false)
    }
    
    if (productId) loadData()
  }, [productId, router, supabase])

  const slugify = (text: string) => text.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '')

  const addImage = () => {
    setImages([...images, { id: 'new_' + Date.now(), url: '', alt_text: '', is_primary: images.length === 0, display_order: images.length }])
  }

  const removeImage = (id: string) => setImages(images.filter(i => i.id !== id))

  const addVariant = () => {
    setVariants([...variants, { id: 'new_' + Date.now(), size: 'M', color: 'Black', color_hex: '#000000', stock_quantity: 10 }])
  }

  const removeVariant = (id: string) => setVariants(variants.filter(v => v.id !== id))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Update Product Basic Info
    const productData = {
      name,
      slug: slugify(name),
      sku: sku || null,
      category_id: categoryId || null,
      base_price: parseFloat(basePrice),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      short_description: shortDesc,
      description: desc,
      fabric: fabric || null,
      is_active: isActive,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      is_bestseller: isBestseller
    }

    const { error: pErr } = await supabase.from('products').update(productData).eq('id', productId)
    if (pErr) { 
      showToast('Error updating product: ' + pErr.message, 'error')
      setSaving(false)
      return 
    }

    // Sync Images
    await supabase.from('product_images').delete().eq('product_id', productId)
    if (images.length > 0) {
      const imgsToInsert = images.map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt_text: img.alt_text || '',
        is_primary: img.is_primary,
        display_order: i
      }))
      await supabase.from('product_images').insert(imgsToInsert)
    }

    // Sync Variants
    await supabase.from('product_variants').delete().eq('product_id', productId)
    if (variants.length > 0) {
      const varsToInsert = variants.map(v => ({
        product_id: productId,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex || null,
        stock_quantity: parseInt(v.stock_quantity) || 0
      }))
      await supabase.from('product_variants').insert(varsToInsert)
    }

    setSaving(false)
    showToast('Product updated successfully', 'success')
    router.push('/admin/products')
    router.refresh()
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Edit Product & Variants</h1>
            <p className="text-sm text-gray-500">{productId}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-brand px-6 py-2.5 rounded-xl flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
              <textarea value={shortDesc} onChange={e => setShortDesc(e.target.value)} required rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Pricing & Fabric</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (₹) *</label>
                <input type="number" min="0" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sale Price (₹)</label>
                <input type="number" min="0" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fabric</label>
                <input type="text" value={fabric} onChange={e => setFabric(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>
          </div>

          {/* Variants Management */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h2 className="font-bold text-[var(--charcoal)]">Product Variants</h2>
              <button onClick={addVariant} type="button" className="text-sm font-medium text-[var(--primary)] flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>
            
            {variants.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No variants added yet. Add sizes or colors.</p>
            ) : (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div key={v.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <input 
                      type="text" value={v.size} placeholder="Size (e.g. S, M)" 
                      onChange={e => { const n = [...variants]; n[idx].size = e.target.value; setVariants(n) }}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                    />
                    <input 
                      type="text" value={v.color} placeholder="Color Name" 
                      onChange={e => { const n = [...variants]; n[idx].color = e.target.value; setVariants(n) }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                    />
                    <input 
                      type="color" value={v.color_hex || '#000000'} title="Color Hex"
                      onChange={e => { const n = [...variants]; n[idx].color_hex = e.target.value; setVariants(n) }}
                      className="w-10 h-9 p-1 border border-gray-200 rounded-lg" 
                    />
                    <input 
                      type="number" value={v.stock_quantity} placeholder="Stock" min="0" title="Stock Quantity"
                      onChange={e => { const n = [...variants]; n[idx].stock_quantity = e.target.value; setVariants(n) }}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm" 
                    />
                    <button onClick={() => removeVariant(v.id)} type="button" className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Management */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
             <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h2 className="font-bold text-[var(--charcoal)]">Product Images</h2>
              <button onClick={addImage} type="button" className="text-sm font-medium text-[var(--primary)] flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Image URL
              </button>
            </div>
            
            {images.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No images added. Paste image URLs below.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={img.id} className="group relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden aspect-[3/4]">
                    {img.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                         <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                         <span className="text-xs">Paste URL</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur pb-2 pt-2 px-2 flex flex-col gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <input 
                        type="url" value={img.url} placeholder="https://..." 
                        onChange={e => { const n = [...images]; n[idx].url = e.target.value; setImages(n) }}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-xs" 
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" name="primary_image" checked={img.is_primary} 
                            onChange={() => { const n = [...images].map(i => ({...i, is_primary: false})); n[idx].is_primary = true; setImages(n) }}
                            className="w-3 h-3" 
                          />
                          <span className="text-[10px] uppercase font-bold text-gray-600">Primary</span>
                        </label>
                        <button onClick={() => removeImage(img.id)} type="button" className="text-red-500 bg-white rounded-full p-1 shadow">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 sticky top-32">
            <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Visibility & Status</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-[var(--primary)] rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Active (Visible in Store)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 text-[var(--primary)] rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} className="w-4 h-4 text-[var(--primary)] rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Mark as New Arrival</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isBestseller} onChange={e => setIsBestseller(e.target.checked)} className="w-4 h-4 text-[var(--primary)] rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Bestseller Badge</span>
              </label>
            </div>
            <div className="pt-4 border-t border-gray-50">
               <div className="text-sm text-gray-500 mb-1">Total Stock across variants:</div>
               <div className="text-2xl font-bold text-[var(--charcoal)]">
                  {variants.reduce((s, v) => s + (parseInt(v.stock_quantity) || 0), 0)}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
