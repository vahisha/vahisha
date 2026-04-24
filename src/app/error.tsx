'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to an MNC-standard tracking service in production
    console.error('Global Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--ivory)] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full animate-fade-up">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold font-serif text-[var(--charcoal)] mb-4">
          Something went wrong
        </h1>
        
        <p className="text-gray-500 mb-10 leading-relaxed">
          The artisanal threads of our site have hit a minor snag. Don't worry, your collection is safe. Please try refreshing or return to our arrivals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-brand px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          
          <Link
            href="/"
            className="px-8 py-4 bg-white border border-gray-200 rounded-xl font-bold text-[var(--charcoal)] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>

        <p className="mt-12 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          Error Reference: {error.digest || 'MNC-G-ERR-500'}
        </p>
      </div>
    </div>
  )
}
