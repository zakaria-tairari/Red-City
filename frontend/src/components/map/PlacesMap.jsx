import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

const MARRAKECH_CENTER = [31.6295, -7.9811]

const defaultIcon = L.divIcon({
  className: 'red-city-marker',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const activeIcon = L.divIcon({
  className: 'red-city-marker active',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

export default function PlacesMap({ places, className, onPlaceClick }) {
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const markersRef = useRef({})
  const clusterRef = useRef(null)
  const { hoveredPlaceId, setHoveredPlaceId } = useUIStore()

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current, {
      center: MARRAKECH_CENTER,
      zoom: 13,
      zoomControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current)

    clusterRef.current = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    })
    mapRef.current.addLayer(clusterRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !clusterRef.current) return

    clusterRef.current.clearLayers()
    markersRef.current = {}

    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon: defaultIcon })
      marker.bindPopup(`
        <div style="min-width:180px;font-family:system-ui">
          <img src="${place.images[0]}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px" alt="${place.name}" />
          <strong style="font-size:14px">${place.name}</strong>
          <p style="margin:4px 0 0;font-size:12px;color:#666">★ ${place.rating} · ${place.location}</p>
          <a href="/places/${place.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:#c92d18">View details →</a>
        </div>
      `)
      marker.on('mouseover', () => setHoveredPlaceId(place.id))
      marker.on('mouseout', () => setHoveredPlaceId(null))
      marker.on('click', () => onPlaceClick?.(place))
      markersRef.current[place.id] = marker
      clusterRef.current.addLayer(marker)
    })

    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [places, onPlaceClick, setHoveredPlaceId])

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.setIcon(id === hoveredPlaceId ? activeIcon : defaultIcon)
      if (id === hoveredPlaceId) marker.openPopup()
    })
  }, [hoveredPlaceId])

  return (
    <div ref={containerRef} className={cn('h-full min-h-[400px] w-full rounded-xl', className)} />
  )
}
