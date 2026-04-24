'use client'

import { Share2 } from 'lucide-react'

export default function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
      title="Share Product"
    >
      <Share2 className="w-5 h-5 text-gray-400" />
    </button>
  )
}
