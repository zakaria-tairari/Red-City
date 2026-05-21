import { LayoutGrid, MapPin, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { CATEGORIES } from '@/data/categories'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

export default function SearchFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  sortBy,
  onSortByChange,
}) {
  const { exploreViewMode, setExploreViewMode } = useUIStore()

  return (
    <div className="fixed top-16 z-40 border-b w-full border-stone-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search places in Marrakech..."
              className="pl-10"
            />
            <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-40">
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
                title="Grid view"
                type="button"
                onClick={() => setExploreViewMode('grid')}
                className={cn(
                  'rounded-lg py-1 px-3 transition-colors',
                  exploreViewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                title='Map view'
                type="button"
                onClick={() => setExploreViewMode('map')}
                className={cn(
                  'rounded-lg py-1 px-3 transition-colors',
                  exploreViewMode === 'map' ? 'bg-primary-600 text-white' : 'text-stone-500 hover:bg-stone-50'
                )}
                aria-label="Map view"
              >
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
