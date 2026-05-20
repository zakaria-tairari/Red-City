import api from '@/lib/api'

/**
 * Reviews API Service
 * Reusable functions to fetch and submit reviews.
 * URLs are configured as placeholders; adjust to match your backend routing.
 */

/**
 * Fetch all reviews written for a specific place.
 * @param {string|number} placeId - Unique identifier of the place
 * @returns {Promise<Array>} Array of reviews
 */
export async function getPlaceReviews(placeId) {
  const response = await api.get(`/places/${placeId}/reviews`)
  return response.data
}

/**
 * Submit a new user review for a specific place.
 * @param {string|number} placeId - ID of place being reviewed
 * @param {Object} reviewData
 * @param {number} reviewData.rating - Star rating (1 to 5)
 * @param {string} reviewData.title - Summary title of review
 * @param {string} reviewData.body - Detailed text content
 * @param {Array<string>} [reviewData.images] - Optional attached images
 * @returns {Promise<Object>} The newly created review object returned from server
 */
export async function createReview(placeId, reviewData) {
  const response = await api.post(`/places/${placeId}/reviews`, {
    rating: reviewData.rating,
    title: reviewData.title,
    body: reviewData.body,
    images: reviewData.images || [],
  })
  return response.data
}
