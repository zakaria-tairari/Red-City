import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Share2, Trash2 } from 'lucide-react'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { Button } from '@/components/ui/Button'

export default function Favorites() {
  const { favoritePlaces, removeFavorite, isLoading } = useFavoritesStore()

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Marrakech Favorites',
        text: `Check out my ${favoritePlaces.length} favorite places in Marrakech!`,
        url: window.location.href,
      })
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-900">Your Favorites</h2>
          <p className="text-stone-500">{favoritePlaces.length} saved places</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share list
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">Loading...</div>
      ) : favoritePlaces.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-stone-200">
          <Heart className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 font-serif font-bold text-xl text-stone-600">No favorites yet</p>
          <p className="mt-2 text-stone-400 text-sm">Save places you love to find them here.</p>
          <Button asChild className="mt-6">
            <Link to="/explore">Explore places</Link>
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
                aria-label="Remove favorite"
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
