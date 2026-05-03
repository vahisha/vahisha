import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, MousePointer2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAHISHA — The Art of Weaving.',
  description: 'Premium women\'s clothing brand. Manufacturer-direct luxury.',
}

const categories = [
  { name: 'Kurtis', slug: 'kurtis', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80', count: '42 styles' },
  { name: 'Dresses', slug: 'dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80', count: '38 styles' },
  { name: 'Co-ord Sets', slug: 'coord-sets', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', count: '24 styles' },
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

  const tagline = (s['store_tagline'] || "Elegance, Uncompromised.").replace(/^"|"$/g, '')
  const taglineParts = tagline.split(/,\s*|\.\s*|-/)
  const heroPrimary = taglineParts[0] || "Elegance"
  const heroSecondary = taglineParts.slice(1).join(' ') || "Uncompromised."
  const storeName = (s['store_name'] || "VAHISHA").replace(/^"|"$/g, '')

  return (
    <div className="bg-[var(--ivory)] selection:bg-[var(--primary)] selection:text-white">
      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
            alt="Hero Banner"
            fill
            className="object-cover object-center scale-105 animate-fade-in"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="inline-block text-[var(--gold)] text-xs font-bold uppercase tracking-[0.4em] mb-6">
              Est. 2024 — {storeName}
            </span>
            <h1 className="font-serif text-6xl sm:text-8xl lg:text-9xl text-white font-medium leading-none mb-8 tracking-tighter">
              {heroPrimary}<br />
              <span className="italic font-light text-[var(--gold-light)] drop-shadow-lg">{heroSecondary}</span>
            </h1>
            <p className="text-gray-200 text-lg sm:text-xl font-light leading-relaxed mb-12 max-w-2xl mx-auto drop-shadow-md">
              A masterclass in textural luxury. Experience manufacturer-direct elegance crafted for the modern woman.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/shop"
                className="bg-white text-[var(--charcoal)] px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-white transition-all duration-500 min-w-[220px]"
              >
                Shop Collection
              </Link>
              <Link
                href="/shop?category=new-arrivals"
                className="glass-card text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-500 min-w-[220px]"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-70">
          <span className="text-white/50 text-[10px] uppercase tracking-[0.3em]">Discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* ─── BRAND MANIFESTO ────────────────────────────────────── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 border border-[var(--gold)]/20 translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700" />
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1610189352649-a89e5a3b3b87?w=800&q=80"
                  alt="Our Craft"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
            </div>
            <div className="space-y-8">
              <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-[0.3em]">Our Philosophy</span>
              <h2 className="text-5xl sm:text-6xl font-serif text-[var(--charcoal)] leading-tight">
                The Art of <br />
                <span className="italic">Exquisite Weaving</span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed font-light">
                At VAHISHA, we believe that true luxury is found in the details. Every piece in our collection is a testament to the skill of our artisans and the purity of our materials. 
              </p>
              <p className="text-gray-500 text-lg leading-relaxed font-light">
                By eliminating the middleman, we bring you uncompromising quality straight from our workshops to your wardrobe, ensuring that elegance remains accessible.
              </p>
              <div className="pt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--charcoal)] group"
                >
                  Learn Our Story
                  <div className="w-12 h-[1px] bg-[var(--charcoal)] group-hover:w-20 transition-all duration-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST FEATURES ──────────────────────────────────────── */}
      <section className="py-24 border-y border-[#E5E1D8] bg-[var(--ivory)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-16">
            {trustFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <Icon className="w-6 h-6 text-[var(--primary)] stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl text-[var(--charcoal)] mb-3">{title}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CURATED CATEGORIES ───────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-[0.3em] mb-4 inline-block">Explore</span>
            <h2 className="text-5xl font-serif text-[var(--charcoal)] mb-4">Curated Archives</h2>
            <div className="w-24 h-[1px] bg-[var(--gold)] mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative h-[600px] overflow-hidden bg-[var(--charcoal-light)]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex flex-col justify-end p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[var(--gold)] text-[10px] uppercase tracking-[0.3em] mb-2">{cat.count}</span>
                  <h3 className="text-white font-serif text-3xl mb-6">{cat.name}</h3>
                  <div className="flex items-center gap-3 text-white/70 text-[10px] uppercase tracking-[0.2em]">
                    View Category <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL SECTION ───────────────────────────────────── */}
      <section className="relative py-48 overflow-hidden bg-[var(--charcoal)]">
        <div className="absolute inset-0 opacity-20">
           <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80"
            alt="Atmospheric"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <Sparkles className="w-10 h-10 text-[var(--gold)] mx-auto mb-12 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-12 italic">
            "A masterclass in textural luxury. VAHISHA redefines what it means to wear art."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-[1px] bg-[var(--gold)]" />
            <p className="text-[var(--gold-light)] text-xs tracking-[0.4em] uppercase font-bold">
              The Editorial Review
            </p>
            <div className="w-12 h-[1px] bg-[var(--gold)]" />
          </div>
        </div>
      </section>

      {/* ─── FEATURED COLLECTION ─────────────────────────────────── */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 border-b border-[#E5E1D8] pb-10">
            <div>
              <span className="text-[var(--primary)] text-xs font-bold uppercase tracking-[0.3em] mb-4 inline-block">Season Selects</span>
              <h2 className="text-5xl font-serif text-[var(--charcoal)]">Masterpiece Collection</h2>
            </div>
            <Link
              href="/shop"
              className="group flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--charcoal)]"
            >
              Discover Entire Shop
              <div className="w-10 h-10 rounded-full border border-[#E5E1D8] flex items-center justify-center group-hover:bg-[var(--charcoal)] group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {featuredProducts.slice(0, 8).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    initialIsWished={wishlistedIds.has(product.id)}
                  />
                ))}
              </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="bg-[#F8F7F4] aspect-[3/4] animate-pulse" />
                  <div className="h-4 bg-[#F8F7F4] w-2/3 animate-pulse" />
                  <div className="h-3 bg-[#F8F7F4] w-1/3 animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── NEWSLETTER / JOIN US ─────────────────────────────────── */}
      <section className="py-32 bg-[var(--ivory)] border-t border-[#E5E1D8]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif text-[var(--charcoal)] mb-6">Join The Inner Circle</h2>
          <p className="text-gray-500 font-light mb-12 text-lg">
            Receive early access to new collections, artisanal insights, and exclusive invitations.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-white border border-[#E5E1D8] px-6 py-4 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <button className="bg-[var(--charcoal)] text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--primary)] transition-colors">
              Subscribe
            </button>
          </form>
          <div className="mt-16 flex justify-center gap-8 text-gray-400">
            {/* Social icons removed due to compatibility issues with current lucide version */}
          </div>
        </div>
      </section>
    </div>
  )
}
