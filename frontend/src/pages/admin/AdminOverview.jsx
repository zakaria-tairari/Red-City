import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertCircle,
  Image,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Tags,
  Users,
} from 'lucide-react'
import { getAdminStats } from '@/services/admin'
import AdminStatCard from '@/components/admin/AdminStatCard'
import { AdminErrorState } from '@/components/admin/AdminPageState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { getApiErrorMessage } from '@/lib/admin'

const MEDIA_COLORS = {
  done: '#059669',
  pending: '#d97706',
  processing: '#2563eb',
  failed: '#dc2626',
}

const RATING_COLORS = [
  '#c92d18',
  '#d94f3b',
  '#e58a7d',
  '#f1c7c0',
  '#d1d5db'
]

function formatNumber(value) {
  return new Intl.NumberFormat().format(value ?? 0)
}

function formatPercent(value) {
  return `${Math.round(value ?? 0)}%`
}

function EmptyChart({ label = 'No data available yet.' }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-stone-200 text-sm text-stone-500">
      {label}
    </div>
  )
}

function HealthMetric({ icon: Icon, label, value, detail, tone = 'bg-primary-600' }) {
  return (
    <div className="space-y-2 rounded-lg border border-stone-100 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-stone-700">
          <Icon className="h-4 w-4 shrink-0 text-stone-500" />
          <span className="truncate">{label}</span>
        </span>
        <span className="text-sm font-bold text-stone-900">{formatPercent(value)}</span>
      </div>
      <Progress value={value} className="h-2" indicatorClassName={tone} />
      <p className="text-xs text-stone-500">{detail}</p>
    </div>
  )
}

function MediaStatusChart({ media }) {
  const data = [
    { name: 'Done', value: media?.done ?? 0, key: 'done' },
    { name: 'Pending', value: media?.pending ?? 0, key: 'pending' },
    { name: 'Processing', value: media?.processing ?? 0, key: 'processing' },
    { name: 'Failed', value: media?.failed ?? 0, key: 'failed' },
  ].filter((item) => item.value > 0)

  if (!data.length) return <EmptyChart label="No media has entered the pipeline yet." />

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.key} fill={MEDIA_COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatNumber(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid content-center gap-3 sm:grid-cols-2">
        {data.map((item) => (
          <div key={item.key} className="rounded-lg bg-stone-50 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MEDIA_COLORS[item.key] }} />
              <p className="text-sm font-medium text-stone-600">{item.name}</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-stone-900">{formatNumber(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewsTrendChart({ data }) {
  if (!data?.some((item) => item.count > 0)) return <EmptyChart label="No review activity in the last 14 days." />

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="reviewTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
          <Tooltip formatter={(value) => [formatNumber(value), 'Reviews']} />
          <Area type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} fill="url(#reviewTrend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function RatingDistributionChart({ data }) {
  if (!data?.some((item) => item.count > 0)) return <EmptyChart label="No ratings have been submitted yet." />

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 12, top: 6, bottom: 6 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
          <YAxis dataKey="rating" type="category" width={58} tickLine={false} axisLine={false} tick={{ fill: '#57534e', fontSize: 12 }} />
          <Tooltip formatter={(value) => [formatNumber(value), 'Reviews']} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.rating} fill={RATING_COLORS[index % RATING_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function RankedList({ items, labelKey, valueKey, emptyLabel }) {
  const maxValue = Math.max(...(items ?? []).map((item) => item[valueKey] ?? 0), 0)

  if (!items?.length) {
    return <p className="rounded-lg bg-stone-50 p-4 text-sm text-stone-500">{emptyLabel}</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = item[valueKey] ?? 0
        const percent = maxValue ? (value / maxValue) * 100 : 0

        return (
          <div key={item.id ?? item[labelKey]} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-stone-700">{item[labelKey]}</span>
              <span className="shrink-0 font-semibold text-stone-900">{formatNumber(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-primary-600" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminOverview() {
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  })

  const stats = response?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <AdminErrorState
        message={getApiErrorMessage(error, 'Could not load dashboard overview.')}
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-700">Operations overview</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-stone-950">Admin analytics</h2>
            <p className="mt-2 max-w-2xl text-sm text-stone-500">
              Monitor content quality, media processing, visitor feedback, and dataset coverage from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/places">Manage places</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/media">Review media</Link>
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Categories', value: stats?.categories },
            { label: 'Media assets', value: stats?.media?.total },
            { label: 'Rated coverage', value: formatPercent(stats?.health?.rated_percent) },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-stone-100 bg-stone-50 px-4 py-3">
              <p className="text-xs font-medium uppercase text-stone-500">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-stone-950">
                {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Places"
          value={formatNumber(stats?.places)}
          icon={MapPin}
          description={`${formatPercent(stats?.health?.media_coverage_percent)} have media`}
          accent="bg-primary-600"
        />
        <AdminStatCard
          label="Reviews"
          value={formatNumber(stats?.reviews)}
          icon={MessageSquare}
          color="text-amber-600"
          description={`${formatNumber(stats?.places_with_ratings)} rated places`}
          accent="bg-amber-500"
        />
        <AdminStatCard
          label="Average rating"
          value={(stats?.average_rating ?? 0).toFixed(1)}
          icon={Star}
          color="text-emerald-600"
          description="Across rated places"
          accent="bg-emerald-600"
        />
        <AdminStatCard
          label="Users"
          value={formatNumber(stats?.users)}
          icon={Users}
          color="text-violet-600"
          description={`${formatNumber(stats?.admins)} admins`}
          accent="bg-violet-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-display text-lg">Review activity</CardTitle>
              <CardDescription>Daily review submissions over the last 14 days.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/reviews">Moderate</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ReviewsTrendChart data={stats?.review_trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Content health</CardTitle>
            <CardDescription>Coverage signals that affect search quality and listing depth.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <HealthMetric
              icon={Tags}
              label="AI tags"
              value={stats?.health?.tagged_percent}
              detail={`${formatNumber(stats?.places_without_tags)} places still need generated tags`}
            />
            <HealthMetric
              icon={ShieldCheck}
              label="Translations"
              value={stats?.health?.translated_percent}
              detail={`${formatNumber(stats?.places_without_translations)} places still need translations`}
            />
            <HealthMetric
              icon={Image}
              label="Media coverage"
              value={stats?.health?.media_coverage_percent}
              detail={`${formatNumber(stats?.places_without_media)} places have no media attached`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-display text-lg">Media pipeline</CardTitle>
              <CardDescription>{formatPercent(stats?.health?.media_done_percent)} of media jobs are complete.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/media">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <MediaStatusChart media={stats?.media} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Rating distribution</CardTitle>
            <CardDescription>Review quality breakdown from five stars to one star.</CardDescription>
          </CardHeader>
          <CardContent>
            <RatingDistributionChart data={stats?.rating_distribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Top categories</CardTitle>
            <CardDescription>Largest content groups by number of places.</CardDescription>
          </CardHeader>
          <CardContent>
            <RankedList items={stats?.top_categories} labelKey="name" valueKey="places" emptyLabel="No categories found." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Top areas</CardTitle>
            <CardDescription>Most represented neighborhoods and districts.</CardDescription>
          </CardHeader>
          <CardContent>
            <RankedList items={stats?.top_areas} labelKey="area" valueKey="count" emptyLabel="No areas found." />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-display text-lg">Recent reviews</CardTitle>
              <CardDescription>Latest user feedback requiring a quick read.</CardDescription>
            </div>
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
                  <li key={review.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">{review.place?.name ?? 'Unknown place'}</p>
                      <p className="line-clamp-1 text-sm text-stone-500">{review.comment || 'No written comment.'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-sm text-stone-500">
                      <span className="max-w-32 truncate">{review.user?.username ?? review.user?.first_name ?? 'User'}</span>
                      <span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">{review.rating}/5</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-display text-lg">Recently added places</CardTitle>
              <CardDescription>Newest records in the city dataset.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/places">Open places</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!stats?.recent_places?.length ? (
              <p className="text-sm text-stone-500">No places have been added yet.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {stats.recent_places.map((place) => (
                  <li key={place.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">{place.name}</p>
                      <p className="truncate text-sm text-stone-500">
                        {place.category?.name ?? 'Uncategorized'} {place.area ? `- ${place.area}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-sm text-stone-500">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-stone-700">{Number(place.avg_rating ?? 0).toFixed(1)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {(stats?.places_without_tags > 0 || stats?.places_without_translations > 0 || stats?.media?.failed > 0) && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Some content still needs enrichment. Run the data-engine ETL or retry failed media jobs to improve listing quality.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/media">Check queue</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
