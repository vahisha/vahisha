import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PrintButton from './PrintButton'

export const metadata: Metadata = { title: 'Shipping Label — VAHISHA' }

export default async function ShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const itemSummary = order.items
    ?.map((i: any) => `${i.product_name} (${i.size || ''}${i.color ? '/' + i.color : ''}) x${i.quantity}`)
    .join(', ')

  const totalQty = order.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0

  return (
    <>
      {/* Print trigger button — hidden when printing */}
      <div className="no-print flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-3">
          <PrintButton />
          <a
            href={`/admin/orders/${id}`}
            className="px-6 py-2.5 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600 flex items-center gap-2"
          >
            ← Back to Order
          </a>
        </div>
        <p className="text-xs text-gray-500">
          The label will print without this toolbar. Use A5 or A4 paper size for best results.
        </p>
      </div>

      {/* The Shipping Label itself */}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8 no-print-bg">
        <div 
          id="shipping-label"
          className="bg-white w-full max-w-[148mm] shadow-2xl print:shadow-none print:w-full print:max-w-none"
          style={{ fontFamily: "'Arial', sans-serif" }}
        >
          {/* Label Top Strip */}
          <div className="bg-[#1a1a1a] text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Logo Mark */}
              <div className="w-7 h-7 bg-white/10 border border-white/20 flex items-center justify-center rounded-sm text-sm font-bold">
                V
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase">VAHISHA</p>
                <p className="text-[8px] text-white/60 tracking-widest">Fashion · Culture · Identity</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/60 uppercase tracking-wider">Shipping Label</p>
              <p className="text-xs font-bold">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Label Body */}
          <div className="p-5 space-y-4">
            {/* FROM — Origin */}
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">FROM</p>
              <p className="text-xs font-bold text-gray-800">VAHISHA Fulfillment Centre</p>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                Plot No. 14, Textile Market Road<br />
                Ring Road, Surat — 395002<br />
                Gujarat, India
              </p>
              <p className="text-[11px] text-gray-600 mt-1">📞 +91-98765-43210</p>
            </div>

            {/* Divider Arrow */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <div className="text-xl">↓</div>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>

            {/* TO — Destination (Large and Bold) */}
            <div className="border-2 border-gray-800 rounded-lg p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">DELIVER TO</p>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {order.shipping_address?.full_name}
              </p>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                {order.shipping_address?.address_line1}
                {order.shipping_address?.address_line2 && <><br />{order.shipping_address?.address_line2}</>}
              </p>
              <p className="text-sm font-bold text-gray-800 mt-1">
                {order.shipping_address?.city}, {order.shipping_address?.state}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1 tracking-widest">
                — {order.shipping_address?.pincode}
              </p>
              <p className="text-xs font-bold text-gray-700 mt-2">
                📞 {order.shipping_address?.phone}
              </p>
            </div>

            {/* Order Details Strip */}
            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 uppercase font-bold tracking-wider">Order No.</p>
                <p className="font-bold text-gray-900 text-xs mt-0.5">{order.order_number}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 uppercase font-bold tracking-wider">Payment</p>
                <p className="font-bold text-gray-900 text-xs mt-0.5 uppercase">{order.payment_method}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 uppercase font-bold tracking-wider">Items</p>
                <p className="font-bold text-gray-900 text-xs mt-0.5">{totalQty} piece(s)</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 uppercase font-bold tracking-wider">Value (COD)</p>
                <p className="font-bold text-gray-900 text-xs mt-0.5">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="border border-gray-200 rounded-lg p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Contents</p>
              <p className="text-[10px] text-gray-700 leading-relaxed">{itemSummary}</p>
            </div>

            {/* Barcode Placeholder */}
            <div className="flex flex-col items-center py-2">
              <div className="flex gap-px items-end h-10">
                {order.order_number.split('').map((char: string, i: number) => (
                  <div
                    key={i}
                    className="bg-gray-900"
                    style={{
                      width: `${(i % 3 === 0 ? 3 : 2)}px`,
                      height: `${((i % 5) + 6) * 4}px`
                    }}
                  />
                ))}
              </div>
              <p className="text-[9px] font-mono tracking-[0.3em] text-gray-600 mt-1">{order.order_number}</p>
            </div>
          </div>

          {/* Label Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 text-center">
            <p className="text-[9px] text-gray-400 leading-relaxed">
              Handle with care · Please do not leave at door · In case of non-delivery, return to sender
            </p>
            <p className="text-[9px] text-gray-400 mt-1">
              Questions? support@vahisha.com | www.vahisha.com
            </p>
          </div>
        </div>
      </div>

      {/* Print-only CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .no-print-bg { background: white !important; padding: 0 !important; }
          body { margin: 0; }
          #shipping-label {
            border: 1px solid #000;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  )
}
