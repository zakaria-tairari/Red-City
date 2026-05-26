import api from '@/lib/api'

export async function fetchPlaces(params) {
  const response = await api.get("/api/places", {
    params,
  })
  return response.data;
}

export async function fetchPlacesByCategory(category, limit = 12) {
  const response = await api.get("/api/places/all", {
    params: {
      category,
      limit,
    }
  });
  return response.data;
}

export async function fetchFeaturedPlaces() {
  const response = await api.get("/api/places/featured");
  return response.data;
}

export async function fetchPlaceById(id) {
  const response = await api.get(`/api/places/${id}`);
  return response.data;
}

export async function fetchRelatedPlaces(id) {
  const response = await api.get(`/api/places/${id}/related`);
  return response.data;
}

export async function fetchSearchResults(query) {
  const response = await api.get(`/api/places/search`, {
    params: {q: query}
  });
  return response.data;
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
