'use client'

import dynamic from 'next/dynamic'

const NewProductForm = dynamic(() => import('./NewProductForm'), { ssr: false })

export default function NewProductPage() {
  return <NewProductForm />
}
