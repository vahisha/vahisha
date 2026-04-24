'use client'

import { useEffect } from 'react'
import { trackProductView } from '@/lib/actions'

export default function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    // Only track if we are in browser
    if (typeof window === 'undefined') return
    
    // Fire and forget
    trackProductView(productId).catch(() => {})
  }, [productId])

  return null
}
