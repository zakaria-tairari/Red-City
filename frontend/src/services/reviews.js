import api from '@/lib/api'

export async function getPlaceReviews(placeId) {
  const response = await api.get(`/api/places/${placeId}/reviews`)
  return response
}

export async function createReview(placeId, reviewData) {
  const response = await api.post(`/api/places/${placeId}/reviews`, {
    rating: reviewData.rating,
    comment: reviewData.title ? `${reviewData.title}\n\n${reviewData.body}` : reviewData.body,
  })
  return response
}

export async function updateReview(reviewId, reviewData) {
  const response = await api.put(`/api/reviews/${reviewId}`, {
    rating: reviewData.rating,
    comment: reviewData.comment,
  })
  return response
}

export async function deleteReview(reviewId) {
  const response = await api.delete(`/api/reviews/${reviewId}`)
  return response
}

export async function getUserReviews() {
  const response = await api.get('/api/user/reviews')
  return response
}
