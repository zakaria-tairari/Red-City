import { Heart, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/Card'

export default function DashboardStats({
  favoritesCount = 0,
  reviewsCount = 0,
}) {
  const { t } = useTranslation()

  const stats = [
    {
      labelKey: 'dashboard.savedPlaces',
      value: favoritesCount,
      icon: Heart,
      color: 'text-primary-600',
    },
    {
      labelKey: 'dashboard.reviewsWritten',
      value: reviewsCount,
      icon: Star,
      color: 'text-amber-500',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.labelKey}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`rounded-xl bg-stone-50 p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
              <p className="text-sm text-stone-500">{t(stat.labelKey)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
