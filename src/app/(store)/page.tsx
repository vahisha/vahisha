import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAHISHA — The Art of Weaving.',
  description: 'Premium women\'s clothing brand. Manufacturer-direct luxury.',
}

const categories = [
  { name: 'Kurtis', slug: 'kurtis', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80', count: '42 styles' },
  { name: 'Dresses', slug: 'dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80', count: '38 styles' },
  { name: 'Co-ord Sets', slug: 'coord-sets', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', count: '24 styles' },
  { name: 'Ethnic Wear', slug: 'ethnic-wear', image: 'https://images.unsplash.com/photo-1610189352649-a89e5a3b3b87?w=600&q=80', count: '31 styles' },
  { name: 'Tops & T-Shirts', slug: 'tops-tshirts', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', count: '56 styles' },
]

const trustFeatures = [
  { icon: ShieldCheck, title: 'Uncompromising Quality', desc: 'Every thread selected with precision' },
  { icon: CheckCircle2, title: 'Direct from Source', desc: 'No middlemen pricing markups' },
  { icon: Sparkles, title: 'Artisanal Craft', desc: 'Hand-finished detailing & fits' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: wishlistQuery } = user ? await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id) : { data: null }
  
  const wishlistedIds = new Set(wishlistQuery?.map(w => w.product_id) || [])

  const { data: settings } = await supabase.from('store_settings').select('*')
  const s: Record<string, string> = {}
  settings?.forEach(row => { 
    if (typeof row.value === 'string') s[row.key] = row.value 
  })

  // Parse tagline gracefully ("Woven with Love. Worn with Pride." -> ["Woven with Love", "Worn with Pride."])
  const tagline = (s['store_tagline'] || "Elegance, Uncompromised.").replace(/^"|"$/g, '')
  const taglineParts = tagline.split(/,\s*|\.\s*|-/)
  const heroPrimary = taglineParts[0] || "Elegance"
  const heroSecondary = taglineParts.slice(1).join(' ') || "Uncompromised."
  const storeName = (s['store_name'] || "VAHISHA").replace(/^"|"$/g, '')

  return (
    <div className="bg-[var(--ivory)] selection:bg-[var(--primary)] selection:text-white">
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="hero-bg min-h-[90vh] flex flex-col justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8 border-b border-[var(--charcoal-light)]">
        {/* Subtle gold glow accent */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--gold)]/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center relative z-10 pt-20 pb-16">
          <div className="animate-fade-up max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-[1px] bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                {storeName} Collection
              </span>
            </div>
            
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5rem] font-medium text-white leading-[1.1] mb-8">
              {heroPrimary},<br />
              <span className="italic text-[var(--primary-light)]">{heroSecondary}</span>
            </h1>
            
            <p className="text-gray-400 text-lg sm:text-xl font-light leading-relaxed mb-10 max-w-lg">
              Experience the pinnacle of manufacturer-direct luxury. Silhouettes crafted with mastery, delivered straight to your wardrobe.
            </p>
            
            <div className="flex flex-wrap gap-5 items-center">
              <Link
                href="/shop"
                className="bg-white text-[var(--charcoal)] px-10 py-4 text-xs font-bold uppercase tracking-[0.15em] border border-white hover:bg-transparent hover:text-white transition-all duration-300 flex items-center gap-2 group"
              >
                Discover Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Hero Image Layout */}
          <div className="hidden lg:block relative h-[700px] animate-fade-in group w-full max-w-lg ml-auto">
            <div className="absolute inset-0 bg-[var(--primary)] mix-blend-color translate-x-4 translate-y-4 opacity-20 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
            <div className="absolute inset-0 border border-[var(--gold)]/30 -translate-x-4 -translate-y-4 transition-transform group-hover:-translate-x-2 group-hover:-translate-y-2" />
            <div className="relative h-full w-full overflow-hidden bg-[var(--charcoal-light)]">
              <Image
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
                alt="Editorial fashion"
                fill
                className="object-cover object-top scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out grayscale-[0.2]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MANIFESTO / FEATURES ──────────────────────────────── */}
      <section className="py-24 border-b border-[#E5E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-[#E5E1D8]">
            {trustFeatures.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`flex flex-col items-center md:items-start ${i !== 0 ? 'md:pl-12 pt-12 md:pt-0' : ''}`}>
                <Icon className="w-8 h-8 text-[var(--primary)] mb-5 stroke-[1.5]" />
                <h3 className="font-serif text-xl text-[var(--charcoal)] mb-3">{title}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-[0.2em] mb-4">Curated</span>
            <h2 className="text-4xl font-serif text-[var(--charcoal)]">The Archives</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative h-[500px] overflow-hidden bg-gray-100"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-end">
                  <div>
                    <h3 className="text-white font-serif text-2xl mb-1">{cat.name}</h3>
                    <p className="text-gray-300 text-xs tracking-wider uppercase">{cat.count}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-white group-hover:text-[var(--charcoal)] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.1em] text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors group"
            >
              View the full collection
              <span className="block w-8 h-[1px] bg-[var(--charcoal)] group-hover:bg-[var(--primary)] group-hover:w-12 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL BANNER ─────────────────────────────────── */}
      <section className="py-24 bg-[var(--charcoal)] text-center px-4">
        <div className="max-w-3xl mx-auto">
          <Sparkles className="w-6 h-6 text-[var(--gold)] mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-8">
            "A masterclass in textural luxury. VAHISHA redefines what it means to wear art."
          </h2>
          <p className="text-[var(--primary-light)] text-sm tracking-[0.2em] uppercase font-semibold">
            — The Editorial Team
          </p>
        </div>
      </section>

      {/* ─── FEATURED ─────────────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-serif text-[var(--charcoal)] mb-4">Featured Pieces</h2>
              <p className="text-gray-500 font-light">The season's most anticipated creations.</p>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--charcoal)] hover:text-[var(--primary)] transition-colors border-b border-[var(--charcoal)] hover:border-[var(--primary)] pb-1"
            >
              Shop All
            </Link>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {featuredProducts.slice(0, 8).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    initialIsWished={wishlistedIds.has(product.id)}
                  />
                ))}
              </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[#E5E1D8] aspect-[3/4] mb-4" />
                  <div className="h-4 bg-[#E5E1D8] w-2/3 mb-2" />
                  <div className="h-3 bg-[#E5E1D8] w-1/3" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
