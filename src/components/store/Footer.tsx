import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}

export default function Footer({ 
  social, 
  tagline, 
  email 
}: { 
  social?: Record<string, string>, 
  tagline?: string, 
  email?: string 
}) {
  return (
    <footer className="bg-[var(--charcoal)] text-gray-300">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-[var(--rose-dark)] to-[var(--primary)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-white text-2xl font-bold font-serif mb-2">
            Join the VAHISHA Family
          </h3>
          <p className="text-pink-100 mb-6 text-sm">
            Subscribe for exclusive offers, new arrivals, and styling tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-sm text-gray-800 outline-none focus:ring-2 focus:ring-white"
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-[var(--primary)] font-bold rounded-full text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
              suppressHydrationWarning
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 border-t border-[var(--charcoal-light)]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
              <span className="text-[var(--charcoal)] font-serif text-lg leading-none mt-0.5">V</span>
            </div>
            <span className="text-xl font-bold tracking-[0.2em] text-white font-serif uppercase">VAHISHA</span>
          </div>
          <p className="text-sm font-light leading-relaxed text-gray-400 mb-6">
            {tagline || "Elegance uncompromised. We are the manufacturers bringing you premium women's clothing without the middleman markup."}
          </p>
          <div className="flex gap-3">
            <a
              href={social?.instagram || "https://instagram.com/vahisha"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-[var(--charcoal)] transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={social?.facebook || "https://facebook.com/vahisha"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-[var(--charcoal)] transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              ['New Arrivals', '/shop?filter=new'],
              ['Kurtis', '/shop?category=kurtis'],
              ['Dresses', '/shop?category=dresses'],
              ['Co-ord Sets', '/shop?category=coord-sets'],
              ['Ethnic Wear', '/shop?category=ethnic-wear'],
              ['Tops & T-Shirts', '/shop?category=tops-tshirts'],
              ['Bestsellers', '/shop?filter=bestseller'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[var(--gold)] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Help</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              ['My Account', '/account'],
              ['Track Order', '/account/orders'],
              ['Return & Refund', '/returns'],
              ['Size Guide', '/size-guide'],
              ['FAQs', '/faqs'],
              ['Contact Us', '/contact'],
              ['Privacy Policy', '/privacy'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[var(--gold)] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 mt-0.5 text-[var(--gold)] shrink-0" />
              <a href={`mailto:${email || 'hello@vahisha.in'}`} className="hover:text-white transition-colors">
                {email || 'hello@vahisha.in'}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 mt-0.5 text-[var(--gold)] shrink-0" />
              <a href="tel:+919876543210" className="hover:text-white transition-colors">
                +91 98765 43210
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 text-[var(--gold)] shrink-0" />
              <span>Mumbai, Maharashtra, India</span>
            </li>
          </ul>

          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-2">We accept</p>
            <div className="flex gap-2 flex-wrap">
              {['UPI', 'Cards', 'NetBanking', 'COD'].map((m) => (
                <span key={m} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VAHISHA. All rights reserved. Made with ❤️ in India.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/sitemap" className="hover:text-gray-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
