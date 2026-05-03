'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { label: 'New Arrivals', href: '/shop?filter=new' },
  {
    label: 'Collections',
    href: '/shop',
    children: [
      { label: 'Kurtis', href: '/shop?category=kurtis' },
      { label: 'Tops & T-Shirts', href: '/shop?category=tops-tshirts' },
      { label: 'Dresses', href: '/shop?category=dresses' },
      { label: 'Co-ord Sets', href: '/shop?category=coord-sets' },
      { label: 'Ethnic Wear', href: '/shop?category=ethnic-wear' },
      { label: 'Shirts', href: '/shop?category=shirts' },
      { label: 'Loungewear', href: '/shop?category=loungewear' },
    ],
  },
  { label: 'Bestsellers', href: '/shop?filter=bestseller' },
  { label: 'About', href: '/about' },
]

export default function Navbar({ 
  announcement 
}: { 
  announcement?: { enabled?: boolean; text?: string } 
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [activeOrdersCount, setActiveOrdersCount] = useState(0)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const initNavbar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser({ email: user.email ?? '' })
        
        // Parallel fetch for badges - MNC performance standards
        const [cartRes, wishRes, orderRes] = await Promise.all([
          // Cart count
          supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', user.id),
          
          // Wishlist count
          supabase
            .from('wishlists')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),

          // Active orders count (excluding delivered/cancelled)
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .not('status', 'in', '("delivered", "cancelled")')
        ])

        if (cartRes.data) setCartCount(cartRes.data.reduce((s, i) => s + i.quantity, 0))
        if (wishRes.count) setWishlistCount(wishRes.count)
        if (orderRes.count) setActiveOrdersCount(orderRes.count)
      }
    }

    initNavbar()
  }, [supabase])

  return (
    <>
      {/* Announcement bar */}
      {announcement?.enabled && announcement.text && (
        <div className="bg-[var(--charcoal)] text-[var(--ivory)] text-center text-[10px] py-2.5 px-4 font-bold tracking-[0.2em] uppercase">
          {announcement.text}
        </div>
      )}

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[4.5rem]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--charcoal)] flex items-center justify-center rounded-sm">
                <span className="text-white font-serif text-lg leading-none mt-0.5">V</span>
              </div>
              <span className="text-xl font-bold tracking-[0.2em] text-[var(--charcoal)] font-serif uppercase">
                VAHISHA
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative group"
                    onMouseEnter={() => setDropdownOpen(link.label)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <button 
                      suppressHydrationWarning
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[var(--primary)] transition-colors"
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {dropdownOpen === link.label && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white shadow-2xl border border-gray-100 py-2 w-48 animate-fade-in z-50">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-[var(--primary)] hover:bg-pink-50 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-gray-700 hover:text-[var(--primary)] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--primary)] after:transition-all hover:after:w-full"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/shop')}
                className="p-2 text-gray-600 hover:text-[var(--primary)] transition-colors"
                aria-label="Search"
                suppressHydrationWarning
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => router.push('/wishlist')}
                className="relative p-2 text-gray-600 hover:text-[var(--primary)] transition-colors hidden sm:block"
                aria-label="Wishlist"
                suppressHydrationWarning
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[var(--primary)] text-white text-[9px] px-1 h-3.5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-[var(--primary)] transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs px-1 h-4 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <Link
                  href="/account"
                  className="relative hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-sm font-medium text-gray-700 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                >
                  <User className="w-4 h-4" />
                  Account
                  {activeOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] px-1 h-4 flex items-center justify-center font-bold ring-1 ring-white">
                      {activeOrdersCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:block px-4 py-1.5 btn-brand text-sm"
                >
                  Login
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-gray-600"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    className="block py-2.5 text-sm font-medium text-gray-700 border-b border-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="pl-4 space-y-1 my-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-sm text-gray-500 hover:text-[var(--primary)]"
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-3 flex gap-3">
                <Link href="/auth/login" className="flex-1 text-center py-2.5 btn-brand text-sm">
                  Login
                </Link>
                <Link href="/account/wishlist" className="flex-1 text-center py-2.5 btn-outline-brand text-sm">
                  Wishlist
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
