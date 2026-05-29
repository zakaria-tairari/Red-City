import { useQuery } from '@tanstack/react-query'
import { FolderTree } from 'lucide-react'
import { getAdminCategories } from '@/services/admin'
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableRow } from '@/components/admin/AdminTable'
import { AdminEmptyState, AdminErrorState } from '@/components/admin/AdminPageState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getApiErrorMessage } from '@/lib/admin'

export default function AdminCategories() {
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAdminCategories,
  })

  const categories = response?.data ?? []
  const totalPlaces = categories.reduce((sum, cat) => sum + (cat.places_count ?? 0), 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary-600" />
            Taxonomy coverage
          </CardTitle>
          <p className="text-sm text-stone-500">
            Categories are maintained by the scraped dataset and ETL. Use this view to monitor distribution and spot taxonomy drift.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-2xl font-bold text-stone-900">{categories.length}</p>
              <p className="text-xs text-stone-500">Categories</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-2xl font-bold text-stone-900">{totalPlaces}</p>
              <p className="text-xs text-stone-500">Assigned places</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4">
              <p className="text-2xl font-bold text-stone-900">
                {categories.filter((cat) => (cat.places_count ?? 0) === 0).length}
              </p>
              <p className="text-xs text-stone-500">Empty categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <AdminErrorState
          message={getApiErrorMessage(error, 'Could not load taxonomy coverage.')}
          onRetry={refetch}
        />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTableCell header>Name</AdminTableCell>
              <AdminTableCell header>Code</AdminTableCell>
              <AdminTableCell header>Places</AdminTableCell>
              <AdminTableCell header>Share</AdminTableCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {categories.length === 0 ? (
              <tr>
                <AdminTableCell colSpan={4}>
                  <AdminEmptyState title="No categories found" />
                </AdminTableCell>
              </tr>
            ) : (
              categories.map((cat) => {
                const share = totalPlaces > 0 ? Math.round(((cat.places_count ?? 0) / totalPlaces) * 100) : 0

                return (
                  <AdminTableRow key={cat.id}>
                    <AdminTableCell className="font-medium">{cat.name}</AdminTableCell>
                    <AdminTableCell className="font-mono text-stone-600">{cat.code}</AdminTableCell>
                    <AdminTableCell>{cat.places_count ?? 0}</AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-primary-600" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-sm text-stone-500">{share}%</span>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                )
              })
            )}
          </AdminTableBody>
        </AdminTable>
      )}
    </div>
  )
}
