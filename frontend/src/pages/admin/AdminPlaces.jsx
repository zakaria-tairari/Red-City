import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Pencil, Search, Trash2 } from 'lucide-react'
import { deleteAdminPlace, getAdminPlaces } from '@/services/admin'
import { fetchCategories } from '@/services/categories'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUIStore } from '@/store/useUIStore'

export default function AdminPlaces() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminPlaces', search, category, page],
    queryFn: () => getAdminPlaces({ search: search || undefined, category: category || undefined, page }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      addNotification({ type: 'success', message: 'Place deleted' })
    },
    onError: (err) => {
      addNotification({ type: 'error', message: err.response?.data?.message || 'Delete failed' })
    },
  })

  const places = response?.data?.items ?? []
  const pagination = response?.data
  const categories = categoriesResponse ?? []

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
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
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTableCell header>Name</AdminTableCell>
                <AdminTableCell header>Category</AdminTableCell>
                <AdminTableCell header>Area</AdminTableCell>
                <AdminTableCell header>Rating</AdminTableCell>
                <AdminTableCell header className="text-right">Actions</AdminTableCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {places.length === 0 ? (
                <tr>
                  <AdminTableCell colSpan={5} className="py-8 text-center text-stone-500">
                    No places found.
                  </AdminTableCell>
                </tr>
              ) : (
                places.map((place) => (
                  <AdminTableRow key={place.id}>
                    <AdminTableCell className="font-medium text-stone-900">{place.name}</AdminTableCell>
                    <AdminTableCell>{place.category?.name ?? '—'}</AdminTableCell>
                    <AdminTableCell>{place.area ?? '—'}</AdminTableCell>
                    <AdminTableCell>{place.avg_rating ?? 0} ({place.reviews_count ?? 0})</AdminTableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(place.id, place.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
