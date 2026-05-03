'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse,
  Tag, Ticket, BarChart3, Settings, ChevronRight, Menu, X, LogOut, Bell,
  TrendingUp, MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/admin' },
  { icon: TrendingUp,      label: 'Insights',   href: '/admin/insights' },
  { icon: Package,         label: 'Products',   href: '/admin/products' },
  { icon: ShoppingCart,    label: 'Orders',      href: '/admin/orders' },
  { icon: MessageSquare,   label: 'Reviews',     href: '/admin/reviews' },
  { icon: Users,           label: 'Customers',   href: '/admin/customers' },
  { icon: Warehouse,       label: 'Inventory',   href: '/admin/inventory' },
  { icon: Tag,             label: 'Categories',  href: '/admin/categories' },
  { icon: Ticket,          label: 'Coupons',     href: '/admin/coupons' },
  { icon: BarChart3,       label: 'Reports',     href: '/admin/reports' },
  { icon: Settings,        label: 'Settings',    href: '/admin/settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setAdminEmail(data.user.email ?? '')
    }
    fetchUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center">
            <span className="text-white font-bold font-serif">V</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-widest font-serif">VAHISHA</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`admin-nav-item flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                active ? 'active text-[#FF6B9D]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: '18px', height: '18px' }} />
              <span className="font-medium">{label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{adminEmail[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{adminEmail}</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          suppressHydrationWarning
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--charcoal)] border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <Link href="/admin" className="text-white font-bold font-serif tracking-widest text-sm">VAHISHA</Link>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => setOpen(!open)} className="p-2 text-gray-400 hover:text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="admin-sidebar absolute left-0 top-0 h-full w-64">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
