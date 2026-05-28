import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2 } from 'lucide-react'
import { deleteAdminReview, getAdminReviews } from '@/services/admin'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUIStore } from '@/store/useUIStore'

export default function AdminReviews() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminReviews', search, page],
    queryFn: () => getAdminReviews({ search: search || undefined, page }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      addNotification({ type: 'success', message: 'Review deleted' })
    },
    onError: (err) => addNotification({ type: 'error', message: err.response?.data?.message || 'Delete failed' }),
  })

  const reviews = response?.data?.items ?? []
  const pagination = response?.data

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          className="pl-10"
          placeholder="Search reviews, places, users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTableCell header>Place</AdminTableCell>
                <AdminTableCell header>User</AdminTableCell>
                <AdminTableCell header>Rating</AdminTableCell>
                <AdminTableCell header>Comment</AdminTableCell>
                <AdminTableCell header className="text-right">Actions</AdminTableCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {reviews.length === 0 ? (
                <tr>
                  <AdminTableCell colSpan={5} className="py-8 text-center text-stone-500">
                    No reviews found.
                  </AdminTableCell>
                </tr>
              ) : (
                reviews.map((review) => (
                  <AdminTableRow key={review.id}>
                    <AdminTableCell className="font-medium">{review.place?.name ?? '—'}</AdminTableCell>
                    <AdminTableCell>{review.user?.username ?? review.user?.email}</AdminTableCell>
                    <AdminTableCell>
                      <span className="font-semibold text-amber-600">{review.rating}/5</span>
                    </AdminTableCell>
                    <AdminTableCell className="max-w-xs truncate text-stone-600">{review.comment}</AdminTableCell>
                    <AdminTableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => {
                          if (!window.confirm('Delete this review?')) return
                          deleteMutation.mutate(review.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">
                Page {pagination.current_page} of {pagination.last_page}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
