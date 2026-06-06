import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, Filter, Star, Pencil, Trash2, X, Check } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { getPlaceReviews, createReview, updateReview, deleteReview } from '@/services/reviews'
import { getRatingBreakdown } from '@/data/mockReviews'
import { RatingStars } from '@/components/ui/RatingStars'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

export default function ReviewsSection({ placeId, placeRating, reviewCount }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [selectedRating, setSelectedRating] = useState('5')
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editHoverRating, setEditHoverRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState(null)
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

  const hasReviewed = isAuthenticated && reviews.some((r) => r.user_id === user?.id)

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const body = form.querySelector('textarea').value

    if (!body.trim()) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.reviewEmptyTitle'),
        message: t('notifications.reviewEmptyMessage'),
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
          title: t('notifications.reviewSuccessTitle'),
          message: t('notifications.reviewSuccessMessage'),
        })

        form.reset()
        setSelectedRating('5')
      } else {
        useUIStore.getState().addNotification({
          type: 'error',
          title: t('notifications.reviewFailedTitle'),
          message: response.error || t('notifications.reviewFailedMessage'),
        })
      }
    } catch {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.genericErrorTitle'),
        message: t('notifications.genericErrorMessage'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = (review) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
  }

  const cancelEditing = () => {
    setEditingReviewId(null)
    setEditRating(0)
    setEditHoverRating(0)
    setEditComment('')
  }

  const handleEditSubmit = async (reviewId) => {
    if (!editComment.trim()) {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.reviewEmptyTitle'),
        message: t('notifications.reviewEmptyMessage'),
      })
      return
    }

    setIsEditSubmitting(true)
    try {
      const response = await updateReview(reviewId, {
        rating: editRating,
        comment: editComment,
      })

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['reviews', placeId] })
        useUIStore.getState().addNotification({
          type: 'success',
          title: t('notifications.reviewUpdatedTitle'),
          message: t('notifications.reviewUpdatedMessage'),
        })
        cancelEditing()
      } else {
        useUIStore.getState().addNotification({
          type: 'error',
          title: t('notifications.genericErrorTitle'),
          message: response.message || t('notifications.genericErrorMessage'),
        })
      }
    } catch {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.genericErrorTitle'),
        message: t('notifications.genericErrorMessage'),
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    setDeletingReviewId(reviewId)
    try {
      const response = await deleteReview(reviewId)

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['reviews', placeId] })
        useUIStore.getState().addNotification({
          type: 'success',
          title: t('notifications.reviewDeletedTitle'),
          message: t('notifications.reviewDeletedMessage'),
        })
      } else {
        useUIStore.getState().addNotification({
          type: 'error',
          title: t('notifications.genericErrorTitle'),
          message: response.message || t('notifications.genericErrorMessage'),
        })
      }
    } catch {
      useUIStore.getState().addNotification({
        type: 'error',
        title: t('notifications.genericErrorTitle'),
        message: t('notifications.genericErrorMessage'),
      })
    } finally {
      setDeletingReviewId(null)
    }
  }

  const isOwnReview = (review) => isAuthenticated && review.user_id === user?.id

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="mt-5">
          <div className="flex items-end gap-4">
            <span className="font-display text-5xl font-bold text-stone-900">{placeRating}</span>
            <div>
              <RatingStars rating={placeRating} size="lg" />
              <p className="mt-1 text-sm text-stone-500">
                {t('reviews.reviewCount', { count: reviewCount.toLocaleString() })}
              </p>
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
              <h3 className="font-serif text-xl font-bold mb-4">{t('reviews.writeTitle')}</h3>
              <div className="space-y-4">
                <div>
                  <Label>{t('reviews.yourRating')}</Label>
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
                  <Label>{t('reviews.comment')}</Label>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm min-h-25 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    placeholder={t('reviews.placeholder')}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('reviews.submitting') : t('reviews.submit')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 flex flex-col items-center justify-center text-center h-full">
              <ThumbsUp className="h-10 w-10 text-stone-300 mb-3" />
              <h3 className="font-serif text-lg font-semibold">{t('reviews.alreadyReviewedTitle')}</h3>
              <p className="text-stone-500 text-sm mt-1">{t('reviews.alreadyReviewedMessage')}</p>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 flex flex-col items-center justify-center text-center h-full">
            <h3 className="font-serif text-lg font-semibold">{t('reviews.joinTitle')}</h3>
            <p className="text-stone-500 text-sm mt-1 mb-4">{t('reviews.joinMessage')}</p>
            <Button asChild variant="outline">
              <a href="/login">{t('reviews.loginToReview')}</a>
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
          <option value="all">{t('reviews.allRatings')}</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>
              {t('reviews.starsOnly', { count: n })}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          : filtered?.length > 0
            ? filtered.map((review) => (
                <article key={review.id} className="rounded-2xl border border-stone-100 bg-white p-6">
                  {editingReviewId === review.id ? (
                    /* ── Edit mode ── */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-base font-semibold">{t('reviews.editTitle')}</h4>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div>
                        <Label>{t('reviews.yourRating')}</Label>
                        <div className="flex gap-1 mt-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className="p-1 transition-colors hover:scale-110 active:scale-95"
                              onMouseEnter={() => setEditHoverRating(star)}
                              onMouseLeave={() => setEditHoverRating(0)}
                              onClick={() => setEditRating(star)}
                            >
                              <Star
                                className={`h-6 w-6 transition-colors ${
                                  star <= (editHoverRating || editRating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-stone-200 text-stone-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>{t('reviews.comment')}</Label>
                        <textarea
                          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm min-h-25 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder={t('reviews.placeholder')}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          disabled={isEditSubmitting}
                        >
                          {t('reviews.cancelEdit')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditSubmit(review.id)}
                          disabled={isEditSubmitting}
                          className="gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {isEditSubmitting ? t('reviews.saving') : t('reviews.saveEdit')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* ── View mode ── */
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarFallback>{review.user?.first_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-stone-900">
                              {review.user?.first_name} {review.user?.last_name}
                            </p>
                            <p className="text-xs text-stone-400">
                              {new Date(review.created_at).toLocaleDateString()}
                              {review.updated_at !== review.created_at && (
                                <span className="ml-1 italic text-stone-300">({t('reviews.edited')})</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <RatingStars rating={review.rating} showValue={false} size="sm" />
                          {review.user.role === 'admin' && <Badge>{t('common.admin')}</Badge>}
                          {isOwnReview(review) && (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                type="button"
                                onClick={() => startEditing(review)}
                                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                                title={t('reviews.editTitle')}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(review.id)}
                                disabled={deletingReviewId === review.id}
                                className="rounded-full p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                title={t('reviews.deleteTitle')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 text-stone-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                    </>
                  )}
                </article>
              ))
            : (
              <p className="text-stone-500 py-4">{t('reviews.noReviews')}</p>
            )}
      </div>
    </div>
  )
}
