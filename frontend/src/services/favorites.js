import api from '@/lib/api'

/**
 * Favorites & Collections API Service
 * Reusable functions to synchronize user favorites and directories.
 * URLs are configured as placeholders; adjust to match your backend routing.
 */

/**
 * Fetch all places saved by the user.
 * @returns {Promise<Array>} Array of favorited places
 */
export async function getFavorites() {
  const response = await api.get('/favorites')
  return response.data
}

/**
 * Add or remove a place from the user's favorites collection.
 * @param {string|number} placeId - ID of place to toggle
 * @returns {Promise<Object>} Object containing the updated favorites array or status
 */
export async function toggleFavorite(placeId) {
  const response = await api.post(`/favorites/toggle`, { place_id: placeId })
  return response.data
}

/**
 * Fetch all user-created collections (custom lists/folders).
 * @returns {Promise<Array>} List of user collections
 */
export async function getCollections() {
  const response = await api.get('/favorites/collections')
  return response.data
}

/**
 * Create a new custom collection.
 * @param {string} name - Name of the collection
 * @returns {Promise<Object>} The newly created collection metadata
 */
export async function createCollection(name) {
  const response = await api.post('/favorites/collections', { name })
  return response.data
}

/**
 * Add a specific place into a collection folder.
 * @param {string} collectionId - ID of target collection
 * @param {string|number} placeId - ID of place being added
 * @returns {Promise<Object>} Server status response
 */
export async function addPlaceToCollection(collectionId, placeId) {
  const response = await api.post(`/favorites/collections/${collectionId}/items`, {
    place_id: placeId,
  })
  return response.data
}
