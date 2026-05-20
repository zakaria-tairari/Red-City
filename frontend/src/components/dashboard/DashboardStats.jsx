import { Heart, Star, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

/**
 * DashboardStats Component
 * Renders a responsive three-column grid displaying key metrics:
 * Saved places, Reviews written, and Places visited.
 *
 * @param {Object} props
 * @param {number} props.favoritesCount - Number of saved places
 * @param {number} [props.reviewsCount=3] - Number of reviews written (mocked)
 * @param {number} [props.visitedCount=12] - Number of places visited (mocked)
 */
export default function DashboardStats({
  favoritesCount = 0,
  reviewsCount = 3,
  visitedCount = 12,
}) {
  const stats = [
    {
      label: 'Saved places',
      value: favoritesCount,
      icon: Heart,
      color: 'text-primary-600',
    },
    {
      label: 'Reviews written',
      value: reviewsCount,
      icon: Star,
      color: 'text-amber-500',
    },
    {
      label: 'Places visited',
      value: visitedCount,
      icon: Clock,
      color: 'text-stone-500',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
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
  )
}
