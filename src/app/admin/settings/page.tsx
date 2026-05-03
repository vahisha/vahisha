import { createClient } from '@/lib/supabase/server'
import { Save } from 'lucide-react'
import type { Metadata } from 'next'
import { updateStoreSettings } from '@/app/admin/actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Settings — Admin' }

export default async function AdminSettings() {
  const supabase = await createClient()

  const { data: settings } = await supabase.from('store_settings').select('*')
  const s: Record<string, unknown> = {}
  settings?.forEach(row => { s[row.key] = row.value })

  const getString = (key: string, fallback = '') =>
    typeof s[key] === 'string' ? s[key] as string : fallback

  const getNumber = (key: string, fallback: number) =>
    typeof s[key] === 'number' ? s[key] as number : fallback

  const announcement = s['announcement_bar'] as { enabled?: boolean; text?: string } | undefined
  const social = s['social_links'] as { instagram?: string; facebook?: string; pinterest?: string } | undefined

  return (
    <form action={updateStoreSettings} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Store Settings</h1>
        <p className="text-sm text-gray-500">Manage your store information and preferences</p>
      </div>

      {/* General Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">General Information</h2>

        {[
          { label: 'Store Name',    key: 'store_name',    placeholder: 'VAHISHA', type: 'text' },
          { label: 'Tagline',       key: 'store_tagline', placeholder: 'Woven with Love. Worn with Pride.', type: 'text' },
          { label: 'Email',         key: 'store_email',   placeholder: 'hello@vahisha.in', type: 'email' },
          { label: 'Phone',         key: 'store_phone',   placeholder: '+91 98765 43210', type: 'text' },
          { label: 'Address',       key: 'store_address', placeholder: 'Mumbai, Maharashtra', type: 'text' },
        ].map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
            <input
              name={field.key}
              type={field.type}
              defaultValue={getString(field.key)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] transition-all"
            />
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Shipping & Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Above (₹)</label>
            <input
              name="free_shipping_above"
              type="number"
              defaultValue={getNumber('free_shipping_above', 499)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Charge (₹)</label>
            <input
              name="shipping_charge"
              type="number"
              defaultValue={getNumber('shipping_charge', 49)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">GST (%)</label>
            <input
              name="gst_percentage"
              type="number"
              defaultValue={getNumber('gst_percentage', 5)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Policy (days)</label>
            <input
              name="return_policy_days"
              type="number"
              defaultValue={getNumber('return_policy_days', 7)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Announcement Bar</h2>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              name="announcement_enabled" 
              type="checkbox" 
              defaultChecked={announcement?.enabled} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">Display globally on storefront</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Announcement Text</label>
          <input
            name="announcement_text"
            type="text"
            defaultValue={announcement?.text ?? ''}
            placeholder="🎉 Free shipping on orders above ₹499!"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-[var(--charcoal)] border-b border-gray-50 pb-3">Social Links</h2>
        {[
          { label: 'Instagram', key: 'instagram', placeholder: 'https://instagram.com/vahisha' },
          { label: 'Facebook',  key: 'facebook',  placeholder: 'https://facebook.com/vahisha' },
          { label: 'Pinterest', key: 'pinterest', placeholder: 'https://pinterest.com/vahisha' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
              name={key}
              type="url"
              defaultValue={social?.[key as keyof typeof social] ?? ''}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>
        ))}
      </div>

      <button type="submit" className="flex items-center justify-center w-full gap-2 btn-brand px-6 py-4 rounded-xl text-sm font-semibold">
        <Save className="w-5 h-5" />
        Save All Settings
      </button>
    </form>
  )
}
