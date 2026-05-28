import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RatingStars } from '@/components/ui/RatingStars'
import { getUserReviews } from '@/services/reviews'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export default function DashboardReviews() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['userReviews'],
    queryFn: getUserReviews,
  })

  const reviews = response?.data || []
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">My Reviews</h2>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-serif">
                    <Link to={`/places/${review.place?.id}`} className="hover:text-primary-600 transition-colors">
                      {review.place?.name}
                    </Link>
                  </CardTitle>
                  <RatingStars rating={review.rating} showValue={false} size="sm" />
                </div>
                <p className="text-xs text-stone-400">{new Date(review.created_at).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600 text-sm whitespace-pre-wrap">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center border rounded-xl border-dashed border-stone-200">
            <p className="text-stone-500">You haven't written any reviews yet.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/explore">Explore places to review</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
