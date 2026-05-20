import { useEffect, useRef } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import { PlaceMapPopup } from './PlaceMapPopup'

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

function FitBounds({ places }) {
  const map = useMap()

  useEffect(() => {
    if (!places.length) return
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [map, places])

  return null
}

function FocusSelectedPlace({ places, selectedPlaceId }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedPlaceId) return
    const place = places.find((p) => p.id === selectedPlaceId)
    if (!place) return

    map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 0.4,
    })
  }, [map, places, selectedPlaceId])

  return null
}

function PlaceMarker({ place, isSelected }) {
  const markerRef = useRef(null)
  const setSelectedPlaceId = useUIStore((s) => s.setSelectedPlaceId)

  useEffect(() => {
    if (!isSelected) return
    const timer = setTimeout(() => markerRef.current?.openPopup(), 450)
    return () => clearTimeout(timer)
  }, [isSelected])

  return (
    <Marker
      ref={markerRef}
      position={[place.lat, place.lng]}
      icon={isSelected ? activeIcon : defaultIcon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e)
          setSelectedPlaceId(place.id)
          markerRef.current?.openPopup()
        },
        popupclose: () => {
          if (useUIStore.getState().selectedPlaceId === place.id) {
            setSelectedPlaceId(null)
          }
        },
      }}
    >
      <Popup
        className="red-city-popup"
        minWidth={300}
        maxWidth={300}
        closeButton={false}
        autoPan
        offset={[0, -8]}
      >
        <PlaceMapPopup
          place={place}
          onClose={() => markerRef.current?.closePopup()}
        />
      </Popup>
    </Marker>
  )
}

export default function PlacesMap({ places, className }) {
  const selectedPlaceId = useUIStore((s) => s.selectedPlaceId)

  return (
    <MapContainer
      center={MARRAKECH_CENTER}
      zoom={13}
      zoomControl={false}
      className={cn('h-full min-h-[400px] w-full rounded-xl', className)}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <FitBounds places={places} />
      <FocusSelectedPlace places={places} selectedPlaceId={selectedPlaceId} />
        {places.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            isSelected={place.id === selectedPlaceId}
          />
        ))}
    </MapContainer>
  )
}
