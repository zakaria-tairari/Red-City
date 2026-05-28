import api from '@/lib/api'

/**
 * Fetch all places saved by the user.
 * @returns {Promise<Array>} Array of favorited places
 */
export async function getFavorites() {
  const response = await api.get('/api/favorites')
  return response
}

/**
 * Add or remove a place from the user's favorites collection.
 * @param {string|number} placeId - ID of place to toggle
 * @returns {Promise<Object>} Object containing the updated favorites array or status
 */
export async function toggleFavorite(placeId) {
  const response = await api.post(`/api/favorites/toggle`, { place_id: placeId })
  return response
}
