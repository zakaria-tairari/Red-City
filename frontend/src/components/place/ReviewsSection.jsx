import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ThumbsUp, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { fetchPlaceReviews } from '@/services/placesService'
import { getRatingBreakdown } from '@/data/mockReviews'
import { RatingStars } from '@/components/ui/RatingStars'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useUIStore } from '@/store/useUIStore'

export default function ReviewsSection({ placeId, placeRating, reviewCount }) {
  const [filter, setFilter] = useState('all')
  const [selectedRating, setSelectedRating] = useState('5')
  const queryClient = useQueryClient()

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => fetchPlaceReviews(placeId),
  })

  const filtered = reviews?.filter((r) => {
    if (filter === 'all') return true
    return r.rating === Number(filter)
  })

  const breakdown = reviews ? getRatingBreakdown(reviews) : []

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const title = form.querySelector('input[type="text"]').value
    const body = form.querySelector('textarea').value

    if (!title.trim() || !body.trim()) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Please enter both a title and review body before submitting.',
      })
      return
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      rating: Number(selectedRating),
      title,
      body,
      date: new Date().toISOString(),
      helpful: 0,
      verified: true,
      images: [],
      author: {
        name: 'You (Traveler)',
        avatar: 'YT',
        country: 'Morocco',
      },
    }

    // Dynamic React Query cache updates!
    queryClient.setQueryData(['reviews', placeId], (oldReviews) => {
      return oldReviews ? [newReview, ...oldReviews] : [newReview]
    })

    // Rich animated toast alert
    useUIStore.getState().addNotification({
      type: 'success',
      title: 'Review Submitted!',
      message: 'Thank you! Your feedback is now visible in the reviews section below.',
    })

    // Reset inputs
    form.reset()
    setSelectedRating('5')
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="mt-5">
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
          className="rounded-2xl border border-stone-300 border-dashed bg-stone-50 p-6"
          onSubmit={handleReviewSubmit}
        >
          <h3 className="font-serif text-lg font-semibold mb-4">Write a review</h3>
          <div className="space-y-4">
            <div>
              <Label>Your rating</Label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="mt-1 bg-white">
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
              <Label>Comment</Label>
              <textarea
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                placeholder="Share your experience..."
                required
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
