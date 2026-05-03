import dynamic from 'next/dynamic'

const EditProductForm = dynamic(() => import('./EditProductForm'), { ssr: false })

export default function EditProductPage() {
  return <EditProductForm />
}
