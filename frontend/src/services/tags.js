import api from '@/lib/api'

export async function fetchTags(params) {
  const response = await api.get("/api/tags", {
    params,
  })
  return response.data
}
