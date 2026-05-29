import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, ExternalLink, Languages, Pencil, Search, Tags } from 'lucide-react'
import { getAdminPlaces } from '@/services/admin'
import { fetchCategories } from '@/services/categories'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminEmptyState, AdminErrorState } from '@/components/admin/AdminPageState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { getApiErrorMessage } from '@/lib/admin'
import { cn } from '@/lib/utils'

const qualityFilters = [
  { value: '', label: 'All places' },
  { value: 'missing_tags', label: 'Missing tags' },
  { value: 'missing_translations', label: 'Missing translations' },
  { value: 'missing_media', label: 'Missing media' },
  { value: 'failed_media', label: 'Failed media' },
]

export default function AdminPlaces() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [quality, setQuality] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 350)

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminPlaces', debouncedSearch, category, quality, page],
    queryFn: () => getAdminPlaces({
      search: debouncedSearch || undefined,
      category: category || undefined,
      quality: quality || undefined,
      page,
    }),
  })

  const places = response?.data?.items ?? []
  const pagination = response?.data
  const categories = categoriesResponse ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Dataset quality queues</h2>
        <p className="mt-1 text-sm text-stone-500">
          Scraped places stay the source of truth. Use this page to find records that need corrections, enrichment, or media repair.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            className="pl-10"
            placeholder="Search by name, area, or document ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="h-10 rounded-xl border border-stone-200 bg-white px-4 text-sm"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
        >
          <option value="">All categories</option>
          {(Array.isArray(categories) ? categories : []).map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-xl border border-stone-200 bg-white px-4 text-sm"
          value={quality}
          onChange={(e) => { setQuality(e.target.value); setPage(1) }}
        >
          {qualityFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </select>
        {isFetching && !isLoading && (
          <span className="text-sm text-stone-400">Refreshing...</span>
        )}
      </div>

      {isError ? (
        <AdminErrorState
          message={getApiErrorMessage(error, 'Could not load places.')}
          onRetry={refetch}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTableCell header>Name</AdminTableCell>
                <AdminTableCell header>Category</AdminTableCell>
                <AdminTableCell header>Area</AdminTableCell>
                <AdminTableCell header>Quality</AdminTableCell>
                <AdminTableCell header>Media</AdminTableCell>
                <AdminTableCell header className="text-right">Actions</AdminTableCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {places.length === 0 ? (
                <tr>
                  <AdminTableCell colSpan={6} className="py-8 text-center text-stone-500">
                    <AdminEmptyState
                      title="No places found"
                      message="Try adjusting the search, category, or quality filter."
                      className="py-4"
                    />
                  </AdminTableCell>
                </tr>
              ) : (
                places.map((place) => (
                  <AdminTableRow key={place.id}>
                    <AdminTableCell className="font-medium text-stone-900">{place.name}</AdminTableCell>
                    <AdminTableCell>{place.category?.name ?? '—'}</AdminTableCell>
                    <AdminTableCell>{place.area ?? '—'}</AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <QualityBadge ok={place.tags_generated} icon={Tags} label="Tags" />
                        <QualityBadge ok={place.translated} icon={Languages} label="Translations" />
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        (place.failed_media_count ?? 0) > 0
                          ? 'bg-red-100 text-red-800'
                          : (place.media_count ?? 0) > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                      )}>
                        {(place.failed_media_count ?? 0) > 0 && <AlertTriangle className="h-3 w-3" />}
                        {place.media_count ?? 0} items
                        {(place.failed_media_count ?? 0) > 0 && ` · ${place.failed_media_count} failed`}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/places/${place.id}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/places/${place.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>

          <AdminPagination pagination={pagination} page={page} onPageChange={setPage} />
        </>
      )}

    </div>
  )
}

function QualityBadge({ ok, icon: Icon, label }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
      ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
    )}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
