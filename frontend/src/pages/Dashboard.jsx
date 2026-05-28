import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { getUserReviews } from '@/services/reviews'
import { fetchPlaces } from '@/services/places'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import DashboardStats from '@/components/dashboard/DashboardStats'
import PlacesRow from "@/components/ui/PlacesRow";

export default function Dashboard() {
  const { favoritePlaces, isLoading: isFavoritesLoading } = useFavoritesStore()

  const { data: reviewsResponse, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['userReviews'],
    queryFn: getUserReviews,
  })

  const { data: recommendedPlaces, isLoading: isRecommendationsLoading } = useQuery({
    queryKey: ['recommendedPlaces'],
    queryFn: () => fetchPlaces({ sortBy: 'reviews', limit: 6 }),
  })

  const recentFavorites = favoritePlaces.slice(0, 4)
  const reviewsCount = reviewsResponse?.data?.length || 0
  const recommendations = recommendedPlaces?.items || []

  return (
    <div className="space-y-10">

      {/* Reusable Statistics Grid Widget */}
      <DashboardStats favoritesCount={favoritePlaces.length} reviewsCount={reviewsCount} />

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
          {isFavoritesLoading ? (
            <div className="flex gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : recentFavorites.length === 0 ? (
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
              {recentFavorites.map((place) => (
                <PlaceCard key={place.id} place={place} className="h-full" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isRecommendationsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-120 w-72 shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlacesRow places={recommendations} title={`Recommended for You`} />
        </div>
      )}
    </div>
  )
}


