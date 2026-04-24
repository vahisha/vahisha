import { Loader2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--ivory)]/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute top-0 w-16 h-16 border-4 border-[var(--primary)] rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-[var(--primary)] font-serif text-xl font-bold">V</span>
        </div>
      </div>
      <p className="mt-6 text-sm font-bold text-[var(--charcoal)] uppercase tracking-[0.3em] animate-pulse">
        VAHISHA
      </p>
    </div>
  )
}
