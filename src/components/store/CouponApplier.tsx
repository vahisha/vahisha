'use client'

import { useState } from 'react'
import { Ticket, X, CheckCircle2, Loader2 } from 'lucide-react'
import { applyCoupon } from '@/lib/actions'
import { useToast } from '@/components/ui/Toast'

interface CouponApplierProps {
  subtotal: number
  onApply: (data: { 
    code: string, 
    discount: number, 
    couponId: string 
  } | null) => void
}

export default function CouponApplier({ subtotal, onApply }: CouponApplierProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const { showToast } = useToast()

  const handleApply = async () => {
    if (!code) return
    
    setLoading(true)
    const res = await applyCoupon(code, subtotal)
    setLoading(false)

    if (res.success) {
      setAppliedCode(code.toUpperCase())
      onApply({
        code: code.toUpperCase(),
        discount: res.discount!,
        couponId: res.couponId!
      })
      showToast('Coupon applied successfully!', 'success')
      setCode('')
    } else {
      showToast(res.reason || 'Invalid coupon', 'error')
    }
  }

  const handleRemove = () => {
    setAppliedCode(null)
    onApply(null)
    showToast('Coupon removed', 'info')
  }

  return (
    <div className="mb-8 pt-6 border-t border-gray-200">
      {appliedCode ? (
        <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-100 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider">Applied</p>
              <p className="text-xs font-bold text-green-700">{appliedCode}</p>
            </div>
          </div>
          <button 
            onClick={handleRemove}
            className="p-1.5 hover:bg-green-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon Code" 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[var(--primary)] transition-colors uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
          </div>
          <button 
            onClick={handleApply}
            disabled={loading || !code}
            className="text-xs font-bold text-[var(--primary)] px-4 py-2 border border-[var(--primary)] rounded-xl hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
          </button>
        </div>
      )}
    </div>
  )
}
