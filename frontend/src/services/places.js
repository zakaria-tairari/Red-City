import api from '@/lib/api'

/**
 * Places API Service
 * Reusable functions to fetch and filter places from the backend API.
 * URLs are configured as placeholders; adjust to match your backend routing.
 */

/**
 * Fetch and filter places based on queries, categories, rating, distance, etc.
 * @param {Object} params
 * @param {string} [params.query] - Search keyword
 * @param {string} [params.category] - Category identifier
 * @param {number} [params.minRating] - Filter by minimum stars rating (0 to 5)
 * @param {string} [params.sortBy] - Sort field ('rating', 'reviews', 'distance', 'name')
 * @param {number} [params.page] - Page number for pagination
 * @param {number} [params.limit] - Number of items per page
 * @param {number} [params.userLat] - Current user latitude for distance sorting
 * @param {number} [params.userLng] - Current user longitude for distance sorting
 * @returns {Promise<Object>} Object containing { items, total, page, totalPages, hasMore }
 */
export async function getPlaces({
  query = '',
  category = '',
  minRating = 0,
  sortBy = 'rating',
  page = 1,
  limit = 12,
  userLat = 31.6295,
  userLng = -7.9811,
} = {}) {
  const response = await api.get('/places', {
    params: {
      q: query,
      category,
      min_rating: minRating,
      sort_by: sortBy,
      page,
      limit,
      lat: userLat,
      lng: userLng,
    },
  })
  return response.data
}

/**
 * Fetch detailed information for a single place.
 * @param {string|number} id - Unique identifier of the place
 * @returns {Promise<Object>} Place detail data
 */
export async function getPlaceById(id) {
  const response = await api.get(`/places/${id}`)
  return response.data
}

/**
 * Fetch featured/top-rated places for home section.
 * @param {number} [limit=5] - Maximum number of items
 * @returns {Promise<Array>} Array of featured places
 */
export async function getFeaturedPlaces(limit = 5) {
  const response = await api.get('/places/featured', {
    params: { limit },
  })
  return response.data
}

/**
 * Fetch places in a specific category.
 * @param {string} categoryId - Category identifier
 * @param {number} [limit=10] - Maximum number of items
 * @returns {Promise<Array>} Array of places in category
 */
export async function getCategoryPlaces(categoryId, limit = 10) {
  const response = await api.get(`/places/categories/${categoryId}`, {
    params: { limit },
  })
  return response.data
}

/**
 * Fetch nearby places based on coordinates of a specific place.
 * @param {string|number} placeId - ID of place to search nearby
 * @param {number} [limit=6] - Maximum number of recommendations
 * @returns {Promise<Array>} Array of nearby places
 */
export async function getNearbyPlaces(placeId, limit = 6) {
  const response = await api.get(`/places/${placeId}/nearby`, {
    params: { limit },
  })
  return response.data
}
