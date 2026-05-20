import { Compass } from 'lucide-react'
import { PlaceCard } from '@/components/ui/PlaceCard'

/**
 * DashboardRecommendations Component
 * Renders traveler-personalized recommendations inside a horizontal scrolling row
 * of full-sized rich place cards, matching the premium visual style of the Home Page.
 *
 * @param {Object} props
 * @param {Array<Object>} props.recommendations - List of place objects to recommend
 */
export default function DashboardRecommendations({ recommendations = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50">
          <Compass className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-stone-900">
            Recommended for You
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Handpicked adventures and luxury escapes tailored to your traveler profile.
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {recommendations.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            variant="horizontal"
            className="w-72 shrink-0 snap-start shadow-md hover:shadow-lg transition-shadow duration-300"
          />
        ))}
      </div>
    </div>
  )
}
