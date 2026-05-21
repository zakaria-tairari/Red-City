import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star } from 'lucide-react'
import { cn, formatReviewCount } from '@/lib/utils'
import { CATEGORY_MAP } from '@/data/categories'

export function PlaceCard({ place, variant = 'default', className, onMouseEnter, onMouseLeave }) {
  const category = place.category;

  if (variant === 'featured') {
    return (
      <motion.article
        className={cn('group relative h-100 overflow-hidden rounded-3xl', className)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/places/${place.id}`} className="block h-full">
          <img
            src={place.cover?.app_url || place.cover?.original_url}
            alt={place.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute bg-linear-to-t from-black/80 via-black/30 to-transparent bottom-0 left-0 right-0 h-1/2 p-4 flex flex-col justify-end text-white">
            {category && (
              <span className="mb-2 w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {category.name}
              </span>
            )}
            <h3 className="font-serif text-xl font-bold md:text-2xl">{place.name}</h3>
            <PlaceMeta place={place} light />
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-0 ring-primary-400/0 transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(229,57,34,0.35)] group-hover:ring-2 group-hover:ring-primary-400/50" />
        </Link>
      </motion.article>
    )
  }

  if (variant === 'horizontal') {
    return (
      <motion.article
        className={cn(
          'group relative h-120 w-72 shrink-0 overflow-hidden rounded-2xl snap-start',
          className
        )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        transition={{ duration: 0.25 }}
      >
        <Link to={`/places/${place.id}`} className="block h-full">
          <img
            src={place.cover?.app_url || place.cover?.original_url}
            alt={place.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute bg-linear-to-t from-black/80 via-black/30 to-transparent bottom-0 left-0 right-0 h-1/2 p-4 flex flex-col justify-end text-white">
            <h3 className="font-serif text-lg font-semibold line-clamp-1">{place.name}</h3>
            <PlaceMeta place={place} light compact />
          </div>
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article
      className={cn(
        'group overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
    >
      <Link to={`/places/${place.id}`}>
        <div className="relative aspect-3/4 overflow-hidden">
          <img
            src={place.cover?.app_url || place.cover?.original_url}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-800 backdrop-blur-sm">
              {category.name}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-stone-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {place.name}
          </h3>
          <PlaceMeta place={place} />
          {place.distance != null && (
            <p className="mt-1 text-xs text-stone-400">{place.distance.toFixed(1)} km away</p>
          )}
        </div>
      </Link>
    </motion.article>
  )
}

function PlaceMeta({ place, light = false, compact = false }) {
  const textClass = light ? 'text-white/90' : 'text-stone-500'
  return (
    <div className={cn('mt-2 flex flex-wrap items-center gap-2 text-sm', textClass, compact && 'mt-1 text-xs')}>
      <span className="inline-flex items-center gap-1">
        <Star className={cn('h-3.5 w-3.5', light ? 'fill-amber-400 text-amber-400' : 'fill-amber-500 text-amber-500')} />
        <span className={cn('font-semibold', light ? 'text-white' : 'text-stone-800')}>4.5</span>
      </span>
      <span>1.2k</span>
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-3 w-3 shrink-0" />
        {place.area}
      </span>
    </div>
  )
}

export default PlaceCard
