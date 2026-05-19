import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { searchPlaces } from '@/services/placesService'
import SearchFilters from '@/components/explore/SearchFilters'
import ExploreListItem from '@/components/explore/ExploreListItem'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import PlacesMap from '@/components/map/PlacesMap'
import { useDebounce } from '@/hooks/useDebounce'
import { useUIStore } from '@/store/useUIStore'

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { exploreViewMode, setHoveredPlaceId } = useUIStore()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating') || 0))
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating')
  const [page, setPage] = useState(1)

  const debouncedQuery = useDebounce(query, 400)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, category, minRating, sortBy, page],
    queryFn: () =>
      searchPlaces({ query: debouncedQuery, category, minRating, sortBy, page }),
    placeholderData: keepPreviousData,
  })

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    setSearchParams(params)
    setPage(1)
  }

  return (
    <motion.div className="min-h-screen pt-16">
      <SearchFilters
        query={query}
        onQueryChange={(v) => {
          setQuery(v)
          updateFilters({ q: v })
        }}
        category={category}
        onCategoryChange={(v) => {
          setCategory(v)
          updateFilters({ category: v })
        }}
        minRating={minRating}
        onMinRatingChange={(v) => {
          setMinRating(v)
          updateFilters({ rating: v || '' })
        }}
        sortBy={sortBy}
        onSortByChange={(v) => {
          setSortBy(v)
          updateFilters({ sort: v })
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-stone-500">
            {isLoading ? 'Searching...' : `${data?.total ?? 0} places found`}
            {isFetching && !isLoading && ' · Updating...'}
          </p>
        </div>

        {exploreViewMode === 'map' ? (
          <div className="grid h-[calc(100vh-220px)] min-h-[500px] gap-4 lg:grid-cols-2">
            <div className="overflow-y-auto space-y-3 pr-2">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                  ))
                : data?.items.map((place) => (
                    <div
                      key={place.id}
                      onMouseEnter={() => setHoveredPlaceId(place.id)}
                      onMouseLeave={() => setHoveredPlaceId(null)}
                      className="cursor-pointer"
                    >
                      <ExploreListItem place={place} />
                    </div>
                  ))}
            </div>
            <PlacesMap
              places={data?.items ?? []}
              className="sticky top-36 h-full"
              onPlaceClick={(p) => navigate(`/places/${p.id}`)}
            />
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
                  ))
                : data?.items.map((place, i) => (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <PlaceCard place={place} />
                    </motion.div>
                  ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-stone-600">
                  Page {page} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!data.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && data?.items.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-xl text-stone-600">No places found</p>
            <p className="mt-2 text-stone-400">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
