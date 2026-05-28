import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { getAdminMedia, getAdminMediaStats, retryAdminMedia } from '@/services/admin'
import AdminStatCard from '@/components/admin/AdminStatCard'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'
import { Image } from 'lucide-react'

const statusColors = {
  done: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
}

export default function AdminMedia() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const addNotification = useUIStore((s) => s.addNotification)

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['adminMediaStats'],
    queryFn: getAdminMediaStats,
  })

  const { data: response, isLoading } = useQuery({
    queryKey: ['adminMedia', status, page],
    queryFn: () => getAdminMedia({ status: status || undefined, page }),
  })

  const retryMutation = useMutation({
    mutationFn: retryAdminMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMedia'] })
      queryClient.invalidateQueries({ queryKey: ['adminMediaStats'] })
      addNotification({ type: 'success', message: 'Download queued' })
    },
    onError: (err) => addNotification({ type: 'error', message: err.response?.data?.message || 'Retry failed' }),
  })

  const stats = statsResponse?.data
  const items = response?.data?.items ?? []
  const pagination = response?.data

  return (
    <div className="space-y-6">
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Total" value={stats?.total ?? 0} icon={Image} />
          <AdminStatCard label="Done" value={stats?.done ?? 0} icon={Image} color="text-emerald-600" />
          <AdminStatCard label="Pending" value={stats?.pending ?? 0} icon={Image} color="text-amber-600" />
          <AdminStatCard label="Failed" value={stats?.failed ?? 0} icon={Image} color="text-red-600" />
        </div>
      )}

      <select
        className="h-10 rounded-xl border border-stone-200 bg-white px-4 text-sm"
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1) }}
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="done">Done</option>
        <option value="failed">Failed</option>
      </select>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTableCell header>Place</AdminTableCell>
                <AdminTableCell header>Type</AdminTableCell>
                <AdminTableCell header>Status</AdminTableCell>
                <AdminTableCell header>Position</AdminTableCell>
                <AdminTableCell header className="text-right">Actions</AdminTableCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {items.length === 0 ? (
                <tr>
                  <AdminTableCell colSpan={5} className="py-8 text-center text-stone-500">
                    No media found.
                  </AdminTableCell>
                </tr>
              ) : (
                items.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell className="font-medium">{item.place?.name ?? `Place #${item.place_id}`}</AdminTableCell>
                    <AdminTableCell>{item.type}</AdminTableCell>
                    <AdminTableCell>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusColors[item.storage_status] ?? 'bg-stone-100')}>
                        {item.storage_status}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>{item.position}</AdminTableCell>
                    <AdminTableCell className="text-right">
                      {item.storage_status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => retryMutation.mutate(item.id)}
                          disabled={retryMutation.isPending}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Retry
                        </Button>
                      )}
                    </AdminTableCell>
                  </AdminTableRow>
                ))
              )}
            </AdminTableBody>
          </AdminTable>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500">Page {pagination.current_page} of {pagination.last_page}</p>
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
