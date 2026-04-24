'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'

export default function WishlistButton({ 
  productId, 
  initialIsWished = false,
  className = "p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
}: { 
  productId: string, 
  initialIsWished?: boolean,
  className?: string
}) {
   const [isWished, setIsWished] = useState(initialIsWished)
   const [loading, setLoading] = useState(false)
   const router = useRouter()
   const { showToast } = useToast()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent navigation if inside a Link card
    
    setLoading(true)
    const res = await toggleWishlist(productId)
    setLoading(false)

    if (!res.success && res.reason === 'unauthorized') {
      router.push('/login?redirect=/wishlist')
      return
    }

    if (res.success) {
      setIsWished(res.action === 'added')
      showToast(res.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist', 'success')
      router.refresh()
    } else {
      showToast('Error: ' + res.reason, 'error')
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      suppressHydrationWarning
      className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Toggle Wishlist"
    >
      <Heart 
        className={`w-4 h-4 transition-colors ${
          isWished 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-400 hover:text-red-400'
        }`} 
      />
    </button>
  )
}
