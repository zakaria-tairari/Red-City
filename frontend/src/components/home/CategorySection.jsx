import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { fetchCategoryPlaces } from '@/services/placesService'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { Skeleton } from '@/components/ui/skeleton'

function CategoryIcon({ name }) {
  const Icon = LucideIcons[name] || LucideIcons.MapPin
  return <Icon className="h-5 w-5 text-primary-600" />
}

export default function CategorySection({ category }) {
  const { data: places, isLoading } = useQuery({
    queryKey: ['category-places', category.id],
    queryFn: () => fetchCategoryPlaces(category.id, 10),
  })

  return (
    <section className="py-16 border-b border-stone-100 last:border-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50">
              <CategoryIcon name={category.icon} />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-stone-900">
                {category.name}
              </h2>
              <p className="mt-1 text-stone-500 max-w-xl">{category.description}</p>
            </div>
          </div>
          <Link
            to={`/explore?category=${category.id}`}
            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-72 shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {places?.map((place, i) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <PlaceCard place={place} variant="horizontal" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
