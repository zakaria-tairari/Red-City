import { Heart, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

/**
 * DashboardStats Component
 * Renders a responsive grid displaying key metrics:
 * Saved places and Reviews written.
 *
 * @param {Object} props
 * @param {number} props.favoritesCount - Number of saved places
 * @param {number} props.reviewsCount - Number of reviews written
 */
export default function DashboardStats({
  favoritesCount = 0,
  reviewsCount = 0,
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
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
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
