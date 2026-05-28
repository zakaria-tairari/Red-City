import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  FolderTree,
  Image,
  MapPin,
  MessageSquare,
  Users,
} from 'lucide-react'
import { getAdminStats } from '@/services/admin'
import AdminStatCard from '@/components/admin/AdminStatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export default function AdminOverview() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  })

  const stats = response?.data

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Places" value={stats?.places ?? 0} icon={MapPin} />
        <AdminStatCard label="Categories" value={stats?.categories ?? 0} icon={FolderTree} color="text-emerald-600" />
        <AdminStatCard label="Reviews" value={stats?.reviews ?? 0} icon={MessageSquare} color="text-amber-500" />
        <AdminStatCard label="Users" value={stats?.users ?? 0} icon={Users} color="text-violet-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Media pipeline</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/media">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Done', value: stats?.media?.done ?? 0, className: 'text-emerald-600' },
              { label: 'Pending', value: stats?.media?.pending ?? 0, className: 'text-amber-600' },
              { label: 'Processing', value: stats?.media?.processing ?? 0, className: 'text-blue-600' },
              { label: 'Failed', value: stats?.media?.failed ?? 0, className: 'text-red-600' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-stone-50 p-4 text-center">
                <p className={`text-2xl font-bold ${item.className}`}>{item.value}</p>
                <p className="text-xs text-stone-500">{item.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Content health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                Places without AI tags
              </span>
              <span className="font-bold text-amber-900">{stats?.places_without_tags ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                Places not translated
              </span>
              <span className="font-bold text-amber-900">{stats?.places_without_translations ?? 0}</span>
            </div>
            <p className="text-xs text-stone-500">
              Run the data-engine ETL to refresh tags and translations.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg">Recent reviews</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/reviews">Moderate</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!stats?.recent_reviews?.length ? (
            <p className="text-sm text-stone-500">No reviews yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {stats.recent_reviews.map((review) => (
                <li key={review.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{review.place?.name}</p>
                    <p className="text-sm text-stone-500 line-clamp-1">{review.comment}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span>{review.user?.username ?? review.user?.first_name}</span>
                    <span className="font-semibold text-amber-600">{review.rating}/5</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
