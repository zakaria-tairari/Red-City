import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2 } from 'lucide-react'
import { deleteAdminReview, getAdminReviews } from '@/services/admin'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog'
import AdminPagination from '@/components/admin/AdminPagination'
import { AdminEmptyState, AdminErrorState } from '@/components/admin/AdminPageState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useUIStore } from '@/store/useUIStore'
import { getApiErrorMessage } from '@/lib/admin'

export default function AdminReviews() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState(null)
  const debouncedSearch = useDebounce(search, 350)
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)

  const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['adminReviews', debouncedSearch, page],
    queryFn: () => getAdminReviews({ search: debouncedSearch || undefined, page }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      setPendingDelete(null)
      addNotification({ type: 'success', message: 'Review deleted' })
    },
    onError: (err) => addNotification({ type: 'error', message: getApiErrorMessage(err, 'Delete failed') }),
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
        {isFetching && !isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            Refreshing
          </span>
        )}
      </div>

      {isError ? (
        <AdminErrorState
          message={getApiErrorMessage(error, 'Could not load reviews.')}
          onRetry={refetch}
        />
      ) : isLoading ? (
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
                    <AdminEmptyState
                      title="No reviews found"
                      message="Try a broader search term."
                      className="py-4"
                    />
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
                        onClick={() => setPendingDelete(review)}
                        disabled={deleteMutation.isPending}
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>

          <AdminPagination pagination={pagination} page={page} onPageChange={setPage} />
        </>
      )}

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete review"
        message={pendingDelete ? `Delete this ${pendingDelete.rating}/5 review for "${pendingDelete.place?.name ?? 'this place'}"? The place rating will be recalculated.` : ''}
        confirmLabel="Delete review"
        destructive
        confirming={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
      />
    </div>
  )
}
