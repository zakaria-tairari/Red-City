import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Star, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PlaceMapPopup({ place, onClose }) {
  const { t } = useTranslation()
  const category = place.category

  return (
    <article className="w-full overflow-hidden bg-white">
      <div className="relative aspect-9/10 overflow-hidden">
        <img
          src={place.cover?.app_url || place.cover?.original_url}
          alt={place.name}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label={t('map.closePopup')}
          className="absolute right-2.5 top-2.5 z-10 flex p-1.5 items-center justify-center rounded-full bg-black/10 text-white backdrop-blur-md transition-colors hover:bg-black/20"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-800 backdrop-blur-sm">
            {category.name}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3.5 pt-10">
          <h3 className="font-serif text-lg font-semibold leading-tight text-white">
            {place.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/85">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">4.5</span>
              <span className="text-white/60">1.2k</span>
            </span>
            <span className="text-white/40">·</span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0 text-white/70" />
              <span className="truncate">{place.area}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-stone-100 bg-stone-50/80 px-3 py-2.5">
        <div>
          {place.distance != null && (
            <span className="text-xs text-stone-500">{place.distance.toFixed(1)} km</span>
          )}
        </div>
        <Link
          to={`/places/${place.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-medium flex items-center justify-end gap-1"
        >
          <span className="text-primary-600 hover:text-primary-700">{t('map.viewDetails')}</span>
          <ArrowRight className="text-primary-600 hover:text-primary-700 h-3 w-3" />
        </Link>
      </div>
    </article>
  )
}
