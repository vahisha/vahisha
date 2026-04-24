import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'VAHISHA — Woven with Love. Worn with Pride.',
    template: '%s | VAHISHA',
  },
  description: 'Premium women\'s clothing brand. Manufacturer-direct prices on kurtis, dresses, tops, co-ord sets, and ethnic wear.',
  keywords: ['women fashion', 'kurti', 'ethnic wear', 'dresses', 'Indian clothing', 'vahisha'],
  openGraph: {
    siteName: 'VAHISHA',
    type: 'website',
  },
}

import { ToastProvider } from '@/components/ui/Toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
