import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import { createClient } from '@/lib/supabase/server'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('store_settings').select('*')
  
  const s: Record<string, any> = {}
  settings?.forEach(row => { s[row.key] = row.value })

  const announcement = s['announcement_bar'] as { enabled?: boolean; text?: string } | undefined
  const social = s['social_links'] as Record<string, string> | undefined
  const tagline = s['store_tagline'] as string | undefined
  const email = s['store_email'] as string | undefined

  return (
    <>
      <Navbar announcement={announcement} />
      <main className="min-h-screen">{children}</main>
      <Footer social={social} tagline={tagline} email={email} />
    </>
  )
}
