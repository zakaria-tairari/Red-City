import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ThumbsUp, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { fetchPlaceReviews } from '@/services/placesService'
import { getRatingBreakdown } from '@/data/mockReviews'
import { RatingStars } from '@/components/ui/RatingStars'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ReviewsSection({ placeId, placeRating, reviewCount }) {
  const [filter, setFilter] = useState('all')
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => fetchPlaceReviews(placeId),
  })

  const filtered = reviews?.filter((r) => {
    if (filter === 'all') return true
    return r.rating === Number(filter)
  })

  const breakdown = reviews ? getRatingBreakdown(reviews) : []

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl font-bold text-stone-900">{placeRating}</span>
            <div>
              <RatingStars rating={placeRating} size="lg" />
              <p className="mt-1 text-sm text-stone-500">{reviewCount.toLocaleString()} reviews</p>
            </div>
          </div>
          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdown} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="stars" tickFormatter={(v) => `${v} ★`} width={40} />
                <Bar dataKey="percent" radius={[0, 4, 4, 0]}>
                  {breakdown.map((entry) => (
                    <Cell key={entry.stars} fill={entry.stars >= 4 ? '#c92d18' : '#d6d3d1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <form
          className="rounded-2xl border border-stone-100 bg-stone-50 p-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <h3 className="font-serif text-lg font-semibold mb-4">Write a review</h3>
          <div className="space-y-4">
            <div>
              <Label>Your rating</Label>
              <Select defaultValue="5">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} stars</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input className="mt-1" placeholder="Summarize your experience" />
            </div>
            <div>
              <Label>Review</Label>
              <textarea
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                placeholder="Share your experience..."
              />
            </div>
            <Button type="submit" className="w-full">Submit review</Button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-stone-400" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter reviews" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>{n} stars only</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          : filtered?.map((review) => (
              <article key={review.id} className="rounded-2xl border border-stone-100 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>{review.author.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-stone-900">{review.author.name}</p>
                      <p className="text-xs text-stone-400">
                        {review.author.country} · {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} showValue={false} size="sm" />
                    {review.verified && <Badge variant="success">Verified</Badge>}
                  </div>
                </div>
                <h4 className="mt-3 font-semibold text-stone-800">{review.title}</h4>
                <p className="mt-2 text-stone-600 leading-relaxed">{review.body}</p>
                {review.images.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {review.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-primary-600"
                >
                  <ThumbsUp className="h-4 w-4" /> Helpful ({review.helpful})
                </button>
              </article>
            ))}
      </div>
    </div>
  )
}
