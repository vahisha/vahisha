import AdminSidebar from '@/components/admin/AdminSidebar'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="hidden lg:flex bg-white border-b border-gray-100 items-center justify-between px-6 h-16 shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 w-72">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              placeholder="Search orders, products..."
              suppressHydrationWarning
              className="bg-transparent text-sm outline-none w-full text-gray-600 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-gray-500 hover:text-[var(--primary)] transition-colors font-medium"
            >
              View Store ↗
            </Link>
            <button 
              suppressHydrationWarning
              className="relative p-2 text-gray-400 hover:text-[var(--primary)] transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--primary)] rounded-full" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto lg:p-8 p-4 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
