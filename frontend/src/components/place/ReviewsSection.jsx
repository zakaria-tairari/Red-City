import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ThumbsUp, Filter, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { getPlaceReviews, createReview } from '@/services/reviews'
import { getRatingBreakdown } from '@/data/mockReviews'
import { RatingStars } from '@/components/ui/RatingStars'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

export default function ReviewsSection({ placeId, placeRating, reviewCount }) {
  const [filter, setFilter] = useState('all')
  const [selectedRating, setSelectedRating] = useState('5')
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()

  const { data: response, isLoading } = useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => getPlaceReviews(placeId),
  })
  
  const reviews = response?.data || []

  const filtered = reviews?.filter((r) => {
    if (filter === 'all') return true
    return r.rating === Number(filter)
  })

  const breakdown = reviews.length ? getRatingBreakdown(reviews) : []
  
  const hasReviewed = isAuthenticated && reviews.some(r => r.user_id === user?.id)

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const body = form.querySelector('textarea').value

    if (!body.trim()) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Please enter a review comment before submitting.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await createReview(placeId, {
        rating: Number(selectedRating),
        body,
      })

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['reviews', placeId] })

        useUIStore.getState().addNotification({
          type: 'success',
          title: 'Review Submitted!',
          message: 'Thank you! Your feedback is now visible in the reviews section below.',
        })

        form.reset()
        setSelectedRating('5')
      } else {
        useUIStore.getState().addNotification({
          type: 'error',
          title: 'Submission Failed',
          message: response.error || 'You may have already reviewed this place.',
        })
      }
    } catch (error) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: 'Error',
        message: 'Something went wrong. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
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

        {isAuthenticated ? (
          !hasReviewed ? (
            <form
              className="rounded-2xl border border-stone-300 border-dashed bg-stone-50 p-6"
              onSubmit={handleReviewSubmit}
            >
              <h3 className="font-serif text-xl font-bold mb-4">Write a review</h3>
              <div className="space-y-4">
                <div>
                  <Label>Your rating</Label>
                  <div className="flex gap-1 mt-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 transition-colors hover:scale-110 active:scale-95"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setSelectedRating(String(star))}
                      >
                        <Star 
                          className={`h-7 w-7 transition-colors ${
                            star <= (hoverRating || Number(selectedRating)) 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'fill-stone-200 text-stone-200'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Comment</Label>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm min-h-25 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit review'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 flex flex-col items-center justify-center text-center h-full">
              <ThumbsUp className="h-10 w-10 text-stone-300 mb-3" />
              <h3 className="font-serif text-lg font-semibold">You've reviewed this place</h3>
              <p className="text-stone-500 text-sm mt-1">Thank you for sharing your experience!</p>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 flex flex-col items-center justify-center text-center h-full">
            <h3 className="font-serif text-lg font-semibold">Join the community</h3>
            <p className="text-stone-500 text-sm mt-1 mb-4">Log in to share your experience.</p>
            <Button asChild variant="outline">
              <a href="/login">Log in to review</a>
            </Button>
          </div>
        )}
      </div>


      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-stone-400" />
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 w-40 rounded-md border border-stone-200 bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>{n} stars only</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          : filtered?.length > 0 ? filtered.map((review) => (
              <article key={review.id} className="rounded-2xl border border-stone-100 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarFallback>{review.user?.first_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-stone-900">{review.user?.first_name} {review.user?.last_name}</p>
                      <p className="text-xs text-stone-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.rating} showValue={false} size="sm" />
                    {
                      review.user.role === 'admin' && <Badge>Admin</Badge>
                    }
                  </div>
                </div>
                <p className="mt-4 text-stone-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
              </article>
            )) : (
              <p className="text-stone-500 py-4">No reviews yet.</p>
            )}
      </div>
    </div>
  )
}
