'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Breadcrumbs() {
  const pathname = usePathname()
  
  // Split path and filter empty strings
  const paths = pathname.split('/').filter(p => p && p !== 'account' && p !== 'admin')
  
  const prettify = (str: string) => {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-gray-400 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
      <Link href="/" className="hover:text-[var(--primary)] transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" />
        Home
      </Link>
      
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`
        const isLast = index === paths.length - 1
        
        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 shrink-0" />
            {isLast ? (
              <span className="text-[var(--charcoal)] font-bold">{prettify(path)}</span>
            ) : (
              <Link href={href} className="hover:text-[var(--primary)] transition-colors">
                {prettify(path)}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
