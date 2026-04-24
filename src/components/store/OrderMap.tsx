'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamic import for Leaflet elements to avoid SSR window issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Simple city-to-coordinate map for India simulation
const CITY_COORDS: Record<string, [number, number]> = {
  'Surat': [21.1702, 72.8311], // Warehouse Origin
  'Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Bangalore': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Ahmedabad': [23.0225, 72.5714],
  'Pune': [18.5204, 73.8567],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
}

interface OrderMapProps {
  status: string
  destinationCity: string
}

export default function OrderMap({ status, destinationCity }: OrderMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    // Client-side only import of Leaflet itself for icons
    import('leaflet').then(mod => {
      setL(mod)
      // Fix for default Leaflet icon paths in Next.js
      delete (mod.Icon.Default.prototype as any)._getIconUrl
      mod.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      })
    })
  }, [])

  if (!isMounted || !L) return <div className="w-full h-[400px] bg-gray-100 rounded-3xl animate-pulse" />

  const origin: [number, number] = CITY_COORDS['Surat']
  const destination: [number, number] = CITY_COORDS[destinationCity] || [28.6139, 77.2090] // Default to Delhi if not found

  // Calculate truck position based on status
  let truckPos: [number, number] = origin
  if (status === 'shipped') {
    // Simulated midpoint for shipped
    truckPos = [(origin[0] + destination[0]) / 2, (origin[1] + destination[1]) / 2]
  } else if (status === 'delivered') {
    truckPos = destination
  }

  // Logistics Icons - Custom styled for VAHISHA
  const truckIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: var(--primary); color: white; padding: 8px; border-radius: 50%; box-shadow: 0 0 10px rgba(231,70,148,0.5);">🚚</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  const warehouseIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: var(--charcoal); color: white; padding: 8px; border-radius: 50%;">🏭</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-gray-100 shadow-inner z-0">
      <MapContainer 
        center={truckPos} 
        zoom={5} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        
        {/* Route Line */}
        <Polyline 
          positions={[origin, destination]} 
          color="var(--primary)" 
          weight={2} 
          dashArray="10, 10" 
          opacity={0.3}
        />

        {/* Warehouse */}
        <Marker position={origin} icon={warehouseIcon}>
          <Popup>VAHISHA Central Warehouse (Surat)</Popup>
        </Marker>

        {/* Customer Location */}
        <Marker position={destination}>
          <Popup>Delivery Destination: {destinationCity}</Popup>
        </Marker>

        {/* The Moving Truck (Current Progress) */}
        {status !== 'pending' && status !== 'confirmed' && (
          <Marker position={truckPos} icon={truckIcon}>
            <Popup className="text-xs font-bold">Your order is currently here!</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
