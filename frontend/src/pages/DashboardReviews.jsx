import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RatingStars } from '@/components/ui/RatingStars'

const myReviews = [
  { id: 1, place: 'Nomad', rating: 5, date: '2025-04-12', excerpt: 'Incredible rooftop views and creative Moroccan fusion...' },
  { id: 2, place: 'Jardin Majorelle', rating: 5, date: '2025-03-28', excerpt: 'A must-see. The blue garden is even more stunning in person.' },
  { id: 3, place: 'Café des Épices', rating: 4, date: '2025-03-15', excerpt: 'Perfect spot for people-watching over fresh orange juice.' },
]

export default function DashboardReviews() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">My Reviews</h2>
      <div className="space-y-4">
        {myReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-serif">{review.place}</CardTitle>
                <RatingStars rating={review.rating} showValue={false} size="sm" />
              </div>
              <p className="text-xs text-stone-400">{new Date(review.date).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600 text-sm">{review.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
