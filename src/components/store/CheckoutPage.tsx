'use client'

import { useState, useTransition } from 'react'
import { formatPrice, getProductPrice } from '@/lib/utils'
import { MapPin, Phone, User, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { placeOrder } from '@/lib/actions'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export default function CheckoutPage({ 
  cartItems, 
  subtotal, 
  shipping, 
  discount = 0,
  total,
  couponId,
  couponCode
}: { 
  cartItems: any[], 
  subtotal: number, 
  shipping: number, 
  discount?: number,
  total: number,
  couponId?: string,
  couponCode?: string
}) {
   const [isPending, startTransition] = useTransition()
   const [orderSuccess, setOrderSuccess] = useState<string | null>(null)
   const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // MNC-Standard Validations
    const phone = formData.get('phone') as string
    const pincode = formData.get('pincode') as string
    
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      showToast('Please enter a valid 10-digit mobile number.', 'error')
      return
    }
    
    if (!/^\d{6}$/.test(pincode)) {
      showToast('Please enter a valid 6-digit pincode.', 'error')
      return
    }

    startTransition(async () => {
      const res = await placeOrder(formData)
      if (res.success) {
        showToast('Order confirmed!', 'success')
        setOrderSuccess(res.orderNumber!)
      } else {
        showToast('Order failed: ' + res.reason, 'error')
      }
    })
  }

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-4">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with VAHISHA.</p>
        <p className="text-sm font-bold text-[var(--charcoal)] mb-8">Order ID: {orderSuccess}</p>
        
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left mb-8">
           <h3 className="font-bold text-sm mb-2">What happens next?</h3>
           <ul className="text-xs text-gray-500 space-y-2 list-disc pl-4">
              <li>You will receive a confirmation call shortly.</li>
              <li>Your order will be processed and shipped within 24-48 hours.</li>
              <li>You can track your order status in your Account Dashboard.</li>
           </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account" className="btn-brand px-8 py-3 rounded-xl font-bold">
            View My Orders
          </Link>
          <Link href="/shop" className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-[var(--charcoal)] hover:bg-gray-50 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-10">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-16">
        {/* Left: Shipping Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-[var(--charcoal)] font-serif mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--primary)]" /> Shipping Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required name="full_name" type="text" placeholder="Janhavi Singh" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white transition-all" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required name="phone" type="tel" placeholder="+91 98765 43210" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white transition-all" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Complete Address</label>
                <textarea required name="address" rows={3} placeholder="House No, Building, Street, Area" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">City</label>
                <input required name="city" type="text" placeholder="Jaipur" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Pincode</label>
                <input required name="pincode" type="text" placeholder="302001" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white transition-all" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">State</label>
                <select required name="state" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white transition-all appearance-none cursor-pointer">
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Hidden Coupon Data */}
          {couponId && <input type="hidden" name="coupon_id" value={couponId} />}
          {couponCode && <input type="hidden" name="discount_amount" value={discount.toString()} />}

          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-[var(--charcoal)] font-serif mb-6">Payment Method</h2>
            <div className="p-4 border-2 border-[var(--primary)] rounded-2xl bg-pink-50/50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full border-4 border-[var(--primary)] bg-white" />
                 <div>
                   <p className="text-sm font-bold text-[var(--charcoal)]">Cash on Delivery (COD)</p>
                   <p className="text-xs text-gray-500">Pay when your order arrives</p>
                 </div>
               </div>
               <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest">Selected</span>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--charcoal)] font-serif mb-8">Order Review</h2>
            
            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={item.variant?.image_url || item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.product?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--charcoal)] truncate">{item.product?.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{item.variant?.size} • {item.variant?.color} • Qty {item.quantity}</p>
                    <p className="text-sm font-bold text-[var(--primary)] mt-1">{formatPrice(getProductPrice(item.product) * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-8 mb-8">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-bold animate-fade-in">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-[var(--charcoal)] pt-4 border-t border-gray-50 mt-4">
                <span>Grand Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full btn-brand py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-70 group"
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Confirm Order
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="mt-6 flex flex-col items-center gap-3 pt-6 border-t border-gray-50">
               <div className="flex items-center gap-2 text-green-600">
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Safe & Secured Checkout</span>
               </div>
               <p className="text-[10px] text-gray-400 text-center leading-relaxed">By placing this order, you agree to VAHISHA's terms of service and return policy.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
