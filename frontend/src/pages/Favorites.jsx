import { Link } from 'react-router-dom'
import { Heart, Share2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { Button } from '@/components/ui/Button'

export default function Favorites() {
  const { t } = useTranslation()
  const { favoritePlaces, removeFavorite, isLoading } = useFavoritesStore()

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('dashboard.shareTitle'),
        text: t('dashboard.shareText', { count: favoritePlaces.length }),
        url: window.location.href,
      })
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-900">{t('dashboard.yourFavorites')}</h2>
          <p className="text-stone-500">{t('dashboard.savedCount', { count: favoritePlaces.length })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> {t('dashboard.shareList')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">{t('common.loading')}</div>
      ) : favoritePlaces.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-stone-200">
          <Heart className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 font-serif font-bold text-xl text-stone-600">{t('dashboard.noFavoritesTitle')}</p>
          <p className="mt-2 text-stone-400 text-sm">{t('dashboard.noFavoritesHint')}</p>
          <Button asChild className="mt-6">
            <Link to="/explore">{t('dashboard.explorePlaces')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favoritePlaces.map((place) => (
            <div key={place.id} className="relative group">
              <PlaceCard place={place} />
              <button
                type="button"
                onClick={() => removeFavorite(place.id)}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                aria-label={t('dashboard.removeFavorite')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
