import api from '@/lib/api'

export async function getAdminStats() {
  return api.get('/api/admin/stats')
}

export async function getAdminPlaces(params = {}) {
  return api.get('/api/admin/places', { params })
}

export async function getAdminPlace(id) {
  return api.get(`/api/admin/places/${id}`)
}

export async function updateAdminPlace(id, data) {
  return api.patch(`/api/admin/places/${id}`, data)
}

export async function deleteAdminPlace(id) {
  return api.delete(`/api/admin/places/${id}`)
}

export async function getAdminCategories() {
  return api.get('/api/admin/categories')
}

export async function createAdminCategory(data) {
  return api.post('/api/admin/categories', data)
}

export async function updateAdminCategory(id, data) {
  return api.patch(`/api/admin/categories/${id}`, data)
}

export async function deleteAdminCategory(id) {
  return api.delete(`/api/admin/categories/${id}`)
}

export async function getAdminReviews(params = {}) {
  return api.get('/api/admin/reviews', { params })
}

export async function deleteAdminReview(id) {
  return api.delete(`/api/admin/reviews/${id}`)
}

export async function getAdminUsers(params = {}) {
  return api.get('/api/admin/users', { params })
}

export async function createAdminUser(data) {
  return api.post('/api/admin/users', data)
}

export async function updateAdminUserRole(id, role) {
  return api.patch(`/api/admin/users/${id}/role`, { role })
}

export async function getAdminMedia(params = {}) {
  return api.get('/api/admin/media', { params })
}

export async function getAdminMediaStats() {
  return api.get('/api/admin/media/stats')
}

export async function retryAdminMedia(id) {
  return api.post(`/api/admin/media/${id}/retry`)
}
