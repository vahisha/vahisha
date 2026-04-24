'use client'

import { useState } from 'react'
import { Star, Loader2, Send } from 'lucide-react'
import { submitReview } from '@/lib/actions'
import { useToast } from '@/components/ui/Toast'

export default function ReviewForm({ productId }: { productId: string }) {
   const [rating, setRating] = useState(5)
   const [loading, setLoading] = useState(false)
   const [submitted, setSubmitted] = useState(false)
   const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('product_id', productId)
    formData.append('rating', rating.toString())
    
    const res = await submitReview(formData)
    setLoading(false)
    if (res.success) {
      setSubmitted(true)
      showToast('Review submitted for moderation!', 'success')
    } else {
      if (res.reason === 'unauthorized') {
         showToast('Please log in to submit a review.', 'info')
      } else {
         showToast('Failed to submit: ' + res.reason, 'error')
      }
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-100 mt-8 text-center max-w-xl mx-auto">
        <p className="text-4xl mb-3">✅</p>
        <h3 className="font-bold mb-1">Review Submitted!</h3>
        <p className="text-sm opacity-80">Your review has been sent to moderation. Thank you for your feedback!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
      <h3 className="text-xl font-bold text-[var(--charcoal)] font-serif mb-6">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                suppressHydrationWarning
                className="focus:outline-none p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Title</label>
          <input 
            type="text" 
            name="title" 
            required 
            suppressHydrationWarning
            placeholder="Sum up your experience" 
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-light)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Review</label>
          <textarea 
            name="body" 
            required 
            suppressHydrationWarning
            placeholder="Tell us what you liked about this product..." 
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary-light)] resize-none"
          />
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            suppressHydrationWarning
            className="btn-brand px-8 py-3.5 rounded-full flex items-center gap-2 text-sm font-bold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
