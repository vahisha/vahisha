import { createClient } from '@/lib/supabase/server'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Customers — Admin' }

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%`)

  const { data: customers } = await query.limit(50)

  // Order count per customer
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('user_id')

  const countMap: Record<string, number> = {}
  orderCounts?.forEach(o => { countMap[o.user_id] = (countMap[o.user_id] ?? 0) + 1 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Customers</h1>
          <p className="text-sm text-gray-500">{customers?.length ?? 0} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <form className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input name="q" defaultValue={params.q} placeholder="Search by name or email..." className="text-sm outline-none bg-transparent flex-1" />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Phone</th>
                <th className="text-left px-6 py-4">Joined</th>
                <th className="text-left px-6 py-4">Orders</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers?.map(c => (
                <tr key={c.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {c.full_name?.[0]?.toUpperCase() ?? c.email[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--charcoal)]">{c.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{c.phone ?? '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[var(--charcoal)]">
                      {countMap[c.id] ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {c.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!customers || customers.length === 0) && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">👥</p>
              <h3 className="font-bold text-[var(--charcoal)] mb-1">No customers yet</h3>
              <p className="text-sm text-gray-400">Customers will appear here once they register.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
