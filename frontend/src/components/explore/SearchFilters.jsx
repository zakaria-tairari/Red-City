import { Grid3X3, Map, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/data/categories'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

export default function SearchFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  minRating,
  onMinRatingChange,
  sortBy,
  onSortByChange,
}) {
  const { exploreViewMode, setExploreViewMode } = useUIStore()

  return (
    <div className="sticky top-16 z-40 border-b border-stone-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search places in Marrakech..."
              className="pl-10"
            />
            <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(minRating)} onValueChange={(v) => onMinRatingChange(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any rating</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
                <SelectItem value="4.8">4.8+ stars</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="reviews">Most reviews</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-xl border border-stone-200 p-1">
              <button
                type="button"
                onClick={() => setExploreViewMode('grid')}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  exploreViewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setExploreViewMode('map')}
                className={cn(
                  'rounded-lg p-2 transition-colors',
                  exploreViewMode === 'map' ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'
                )}
                aria-label="Map view"
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
