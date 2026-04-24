'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types/database'
import { useToast } from '@/components/ui/Toast'

export default function AddToCartButton({ 
  product, 
  variantId,
  disabled = false
}: { 
  product: Product,
  variantId?: string | null,
  disabled?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
   const router = useRouter()
   const supabase = createClient()
   const { showToast } = useToast()
 
   const handleAction = async () => {
     if (showCheckout) {
       router.push('/checkout')
       return
     }

     if (!variantId && product.variants && product.variants.length > 0) {
       showToast('Please select a size and color first.', 'info')
       return
     }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=' + window.location.pathname)
      return
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: product.id,
        variant_id: variantId || (product.variants?.[0]?.id ?? null),
        quantity: 1,
      }, { onConflict: 'user_id,product_id,variant_id' })

    setLoading(false)
    if (!error) {
      setAdded(true)
      showToast('Added to bag!', 'success')
      setTimeout(() => {
        setAdded(false)
        setShowCheckout(true)
      }, 1500)
      router.refresh()
    } else {
      showToast('Failed to add: ' + error.message, 'error')
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAction}
        disabled={loading || disabled}
        suppressHydrationWarning
        className={`flex-1 px-6 py-4 border-radius-[3px] text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
          showCheckout 
            ? 'bg-[var(--gold)] text-[var(--charcoal)] hover:bg-[#c5a030] shadow-lg scale-[1.02]' 
            : 'btn-brand'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{ borderRadius: '3px' }}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : showCheckout ? (
          <ShoppingBag className="w-5 h-5" />
        ) : (
          <ShoppingBag className="w-5 h-5" />
        )}
        
        {added ? '✓ Added to Bag!' : showCheckout ? 'Proceed to Buy →' : 'Add to Bag'}
      </button>
    </div>
  )
}

