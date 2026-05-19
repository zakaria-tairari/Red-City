import { delay, haversineKm } from '@/lib/utils'
import {
  MOCK_PLACES,
  getPlaceById,
  getTopRated,
  getByCategory,
} from '@/data/mockPlaces'
import { generateReviewsForPlace } from '@/data/mockReviews'

const PAGE_SIZE = 12

export async function fetchFeaturedPlaces() {
  await delay(500)
  return getTopRated(5)
}

export async function fetchCategoryPlaces(categoryId, limit = 10) {
  await delay(350)
  return getByCategory(categoryId, limit)
}

export async function fetchPlace(id) {
  await delay(400)
  const place = getPlaceById(id)
  if (!place) throw new Error('Place not found')
  return place
}

export async function fetchPlaceReviews(placeId) {
  await delay(450)
  return generateReviewsForPlace(placeId, 14)
}

export async function fetchNearbyPlaces(placeId, limit = 6) {
  await delay(300)
  const place = getPlaceById(placeId)
  if (!place) return []
  return MOCK_PLACES.filter(
    (p) => p.id !== placeId && p.category === place.category
  )
    .sort((a, b) => {
      const distA = haversineKm(place.lat, place.lng, a.lat, a.lng)
      const distB = haversineKm(place.lat, place.lng, b.lat, b.lng)
      return distA - distB
    })
    .slice(0, limit)
}

export async function searchPlaces({
  query = '',
  category = '',
  minRating = 0,
  sortBy = 'rating',
  page = 1,
  userLat = 31.6295,
  userLng = -7.9811,
}) {
  await delay(550)

  let results = [...MOCK_PLACES]

  if (query.trim()) {
    const q = query.toLowerCase()
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.description?.toLowerCase().includes(q)
    )
  }

  if (category) {
    results = results.filter((p) => p.category === category)
  }

  if (minRating > 0) {
    results = results.filter((p) => p.rating >= minRating)
  }

  results = results.map((p) => ({
    ...p,
    distance: haversineKm(userLat, userLng, p.lat, p.lng),
  }))

  switch (sortBy) {
    case 'rating':
      results.sort((a, b) => b.rating - a.rating)
      break
    case 'reviews':
      results.sort((a, b) => b.reviewCount - a.reviewCount)
      break
    case 'distance':
      results.sort((a, b) => a.distance - b.distance)
      break
    case 'name':
      results.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      break
  }

  const total = results.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const items = results.slice(start, start + PAGE_SIZE)

  return {
    items,
    total,
    page,
    totalPages,
    hasMore: page < totalPages,
  }
}
