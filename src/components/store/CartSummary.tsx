'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import CouponApplier from './CouponApplier'

interface CartSummaryProps {
  subtotal: number
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const [coupon, setCoupon] = useState<{ code: string; discount: number; couponId: string } | null>(null)
  
  const shipping = subtotal > 499 ? 0 : 99
  const discountAmount = coupon?.discount || 0
  const total = Math.max(0, subtotal + shipping - discountAmount)

  // Construct checkout URL with coupon persistence
  const checkoutUrl = coupon 
    ? `/checkout?coupon=${coupon.code}&discount=${coupon.discount}&cid=${coupon.couponId}`
    : '/checkout'

  return (
    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 sticky top-24">
      <h2 className="text-xl font-bold text-[var(--charcoal)] font-serif mb-6">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--charcoal)]">{formatPrice(subtotal)}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 animate-fade-in">
            <span>Discount ({coupon?.code})</span>
            <span className="font-bold">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span className="font-medium text-[var(--charcoal)]">
            {shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}
          </span>
        </div>
        
        {shipping > 0 && (
          <p className="text-[10px] text-gray-400">Add {formatPrice(499 - subtotal)} more for FREE shipping</p>
        )}
      </div>

      <CouponApplier subtotal={subtotal} onApply={setCoupon} />

      <div className="flex justify-between items-end border-t border-gray-200 pt-6 mb-8">
        <div>
          <p className="text-sm font-bold text-[var(--charcoal)]">Grand Total</p>
          <p className="text-[10px] text-gray-400 capitalize">Inclusive of all taxes</p>
        </div>
        <p className="text-2xl font-bold text-[var(--charcoal)]">{formatPrice(total)}</p>
      </div>

      <Link 
        href={checkoutUrl} 
        className="w-full btn-brand py-4 rounded-xl font-bold flex items-center justify-center gap-2 group"
      >
        Checkout Securely
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      
      <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
         <ShieldCheck className="w-4 h-4" />
         <span className="text-[10px] font-medium uppercase tracking-widest">Safe & Secured Payments</span>
      </div>
    </div>
  )
}
