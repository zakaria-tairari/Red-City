import api from '@/lib/api'

export async function sendChatMessage(message) {
  const response = await api.post('/api/chat/recommend', { message })
  return response.data
}
