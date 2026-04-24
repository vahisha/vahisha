'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-brand px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
    >
      🖨️ Print Label
    </button>
  )
}
