import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import { cn, formatReviewCount } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

export default function ExploreListItem({ place }) {
  const { hoveredPlaceId } = useUIStore()
  const isActive = hoveredPlaceId === place.id

  return (
    <Link
      to={`/places/${place.id}`}
      className={cn(
        'flex gap-4 rounded-xl border p-3 transition-all hover:shadow-md',
        isActive ? 'border-primary-300 bg-primary-50 shadow-md' : 'border-stone-100 bg-white'
      )}
    >
      <img
        src={place.images[0]}
        alt={place.name}
        className="h-20 w-24 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-serif font-semibold text-stone-900 truncate">{place.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-stone-700">{place.rating}</span>
          <span>({formatReviewCount(place.reviewCount)})</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
          <MapPin className="h-3 w-3" />
          {place.location}
          {place.distance != null && ` · ${place.distance.toFixed(1)} km`}
        </p>
      </div>
    </Link>
  )
}
