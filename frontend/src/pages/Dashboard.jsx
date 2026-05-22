import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Compass, Sparkles } from 'lucide-react'
import { MOCK_PLACES } from '@/data/mockPlaces'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getTopRated } from '@/data/mockPlaces'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardRecommendations from '@/components/dashboard/DashboardRecommendations'

export default function Dashboard() {
  const favorites = useFavoritesStore((s) => s.favorites)
  const favoritePlaces = MOCK_PLACES.filter((p) => favorites.includes(p.id)).slice(0, 4)
  const recommendations = getTopRated(6) // Fetch 6 items for horizontal scrolling layout

  return (
    <div className="space-y-10">

      {/* Reusable Statistics Grid Widget */}
      <DashboardStats favoritesCount={favorites.length} />

      {/* Favorites Collection List */}
      <Card className="overflow-hidden border-stone-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-stone-50 bg-stone-50/30 px-6 py-4">
          <div className="space-y-1">
            <CardTitle className="font-display text-lg">My Favorites</CardTitle>
            <p className="text-xs text-stone-500">Quick access to saved places</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/favorites" className="gap-1.5">
              Afficher tout <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {favoritePlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-stone-50 p-4 mb-4">
                <Compass className="h-8 w-8 text-stone-400" />
              </div>
              <p className="text-stone-500 text-sm max-w-sm mb-4">
                You haven't saved any places yet. Browse the catalog and save riads, cafés, or souks to view them here.
              </p>
              <Button asChild size="sm">
                <Link to="/explore">Start exploring</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {favoritePlaces.map((place) => (
                <PlaceCard key={place.id} place={place} className="h-full" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended for You scrollable horizontal Section */}
      <DashboardRecommendations recommendations={recommendations} />
    </div>
  )
}


