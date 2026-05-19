import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Heart, Star } from 'lucide-react'
import { MOCK_PLACES } from '@/data/mockPlaces'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getTopRated } from '@/data/mockPlaces'

const recentActivity = [
  { id: 1, action: 'Saved', place: 'Jardin Majorelle', time: '2 hours ago' },
  { id: 2, action: 'Reviewed', place: 'Nomad', time: 'Yesterday' },
  { id: 3, action: 'Viewed', place: 'Royal Mansour', time: '2 days ago' },
]

export default function Dashboard() {
  const favorites = useFavoritesStore((s) => s.favorites)
  const favoritePlaces = MOCK_PLACES.filter((p) => favorites.includes(p.id)).slice(0, 4)
  const recommendations = getTopRated(4)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Saved places', value: favorites.length, icon: Heart, color: 'text-primary-600' },
          { label: 'Reviews written', value: 3, icon: Star, color: 'text-amber-500' },
          { label: 'Places visited', value: 12, icon: Clock, color: 'text-stone-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl bg-stone-50 p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-sm text-stone-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Favorite Places</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/favorites">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {favoritePlaces.length === 0 ? (
            <p className="text-stone-500 text-sm py-8 text-center">
              No favorites yet.{' '}
              <Link to="/explore" className="text-primary-600 hover:underline">Start exploring</Link>
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {favoritePlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-stone-800">
                    {item.action} <span className="text-primary-600">{item.place}</span>
                  </p>
                  <p className="text-xs text-stone-400">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recommended for You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((place) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-stone-50 transition-colors"
              >
                <img src={place.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-sm text-stone-800">{place.name}</p>
                  <p className="text-xs text-stone-400">★ {place.rating} · {place.location}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
