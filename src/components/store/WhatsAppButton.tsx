'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  productName: string
  productUrl: string
  phoneNumber?: string
}

export default function WhatsAppButton({ 
  productName, 
  productUrl, 
  phoneNumber = '919876543210' // Placeholder for VAHISHA support
}: WhatsAppButtonProps) {
  
  const handleWhatsAppClick = () => {
    const message = `Hi VAHISHA! I'm interested in the ${productName}. Could you provide more details? \n\nLink: ${productUrl}`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-green-200/50 group"
    >
      <MessageCircle className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
      Buy on WhatsApp
    </button>
  )
}
