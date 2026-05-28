import { useQuery } from '@tanstack/react-query'
import { fetchPlacesByCategory } from '@/services/places'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTranslation } from 'react-i18next'
import PlacesRow from '@/components/ui/PlacesRow'

export default function CategorySection({ category }) {
  const { t } = useTranslation()

  const { data: places, isLoading } = useQuery({
    queryKey: ['category-places', category.id],
    queryFn: () => fetchPlacesByCategory(category.id, 12),
  })

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-72 shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PlacesRow
        places={places}
        title={t(`categories.${category.code}`)}
        viewAllHref={`/explore?category=${category.id}`}
        viewAllLabel={t('common.viewAll')}
      />
    </div>
  )
}