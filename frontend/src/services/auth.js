import api from '@/lib/api'

export async function login({ email, password }) {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/auth/login', { email, password })
  return response
}

export async function register(userData) {
  await api.get('/sanctum/csrf-cookie');

  const response = await api.post('/auth/register', {
    first_name: userData.firstName,
    last_name: userData.lastName,
    username: userData.username,
    email: userData.email,
    password: userData.password,
    password_confirmation: userData.passwordConfirmation
  })

  return response
}

export async function getProfile() {
  const response = await api.get('/api/user')
  return response
}

export async function updateProfile(data) {
  const response = await api.patch('/api/user/profile', data)
  return response
}

export async function logout() {
  const response = await api.post('/auth/logout')
  return response
}

export async function resendVerificationEmail(email) {
  await api.get('/sanctum/csrf-cookie');
  const response = await api.post('/api/email/verification-notification', { email })
  return response
}
