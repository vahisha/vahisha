import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import type { Metadata } from 'next'
import { Star, CheckCircle, XCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Review Moderation — Admin' }

export default async function AdminReviews() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, email),
      product:products(name, slug)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--charcoal)] font-serif">Customer Reviews</h1>
        <p className="text-sm text-gray-500">Moderate and approve incoming user reviews.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Review</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!reviews || reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No reviews in the system yet.
                  </td>
                </tr>
              ) : (
                reviews.map(r => {
                  const u = r.user as any
                  const p = r.product as any
                  
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[var(--charcoal)] mb-1">{r.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 max-w-sm mb-2">{r.body}</p>
                        <p className="text-[10px] text-gray-400">
                          By <span className="font-medium text-gray-600">{u?.full_name || u?.email}</span> 
                          {' • '} {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`/shop/product/${p?.slug}`} target="_blank" className="text-xs font-semibold text-[var(--primary)] hover:underline line-clamp-2 max-w-[200px]">
                          {p?.name}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.is_approved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => {
                           'use server'
                           const { toggleReviewApproval } = await import('@/app/admin/actions')
                           await toggleReviewApproval(r.id, !r.is_approved)
                        }}>
                          <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${r.is_approved ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]'}`}>
                            {r.is_approved ? 'Hide Review' : 'Approve'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
