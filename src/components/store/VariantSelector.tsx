'use client'

import { useState, useMemo } from 'react'
import AddToCartButton from './AddToCartButton'
import { Product } from '@/types/database'

export default function VariantSelector({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  // Get unique colors and sizes from variants
  const colors = useMemo(() => {
    const map = new Map<string, { color: string; hex: string }>()
    product.variants?.forEach(v => {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, hex: v.color_hex })
      }
    })
    return Array.from(map.values())
  }, [product.variants])

  const sizes = useMemo(() => {
    const set = new Set<string>()
    product.variants?.forEach(v => {
      if (selectedColor) {
        if (v.color === selectedColor) set.add(v.size)
      } else {
        set.add(v.size)
      }
    })
    return Array.from(set)
  }, [product.variants, selectedColor])

  // Find the exact variant ID based on selection
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null
    return product.variants?.find(v => v.color === selectedColor && v.size === selectedSize) || null
  }, [product.variants, selectedColor, selectedSize])

  return (
    <div className="space-y-6">
      {/* Color selector */}
      {colors.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-semibold text-[var(--charcoal)] mb-2 uppercase tracking-wide">
            Colour: <span className="text-gray-500 font-normal">{selectedColor || 'Choose a color'}</span>
          </p>
          <div className="flex gap-3 flex-wrap">
            {colors.map((c) => (
              <button
                key={c.color}
                title={c.color}
                onClick={() => setSelectedColor(c.color)}
                suppressHydrationWarning
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor === c.color 
                    ? 'border-[var(--primary)] scale-110 shadow-md ring-2 ring-[var(--primary-light)] ring-offset-2' 
                    : 'border-white shadow-sm hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex ?? '#ccc' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[var(--charcoal)] uppercase tracking-wide">
              Size: <span className="text-gray-500 font-normal">{selectedSize || 'Choose a size'}</span>
            </p>
            <button suppressHydrationWarning className="text-xs text-[var(--primary)] hover:underline font-medium">Size Guide</button>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {sizes.map((size) => {
              const available = product.variants?.some(v => v.size === size && (selectedColor ? v.color === selectedColor : true) && v.stock_quantity > 0)
              
              return (
                <button
                  key={String(size)}
                  disabled={!available}
                  onClick={() => setSelectedSize(String(size))}
                  suppressHydrationWarning
                  className={`px-5 py-2.5 border rounded-xl text-sm font-bold transition-all ${
                    selectedSize === String(size)
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md'
                      : available
                        ? 'border-gray-200 text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)]'
                        : 'border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  {String(size)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Buy Actions */}
      <div className="pt-2">
        {selectedVariant && selectedVariant.stock_quantity <= 0 ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 mb-4 text-center">
            This variant is currently out of stock.
          </div>
        ) : null}
        
        <AddToCartButton 
          product={product} 
          variantId={selectedVariant?.id} 
          disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
        />
        
        {!selectedVariant && (
          <p className="text-[10px] text-gray-400 mt-3 text-center uppercase tracking-widest font-bold">
            Select size & color to enable checkout
          </p>
        )}
      </div>
    </div>
  )
}
