import api from '@/lib/api'

/**
 * Authentication & Profiles API Service
 * Reusable functions to handle user sessions and auth checks.
 * URLs are configured as placeholders; adjust to match your backend routing.
 */

/**
 * Log in a user with credentials.
 * @param {Object} credentials
 * @param {string} credentials.email - User email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Object containing user details and authorization tokens/sessions
 */
export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

/**
 * Register a new user account.
 * @param {Object} userData
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.username - Chosen unique handle
 * @param {string} userData.email - Primary email address
 * @param {string} userData.password - Account password
 * @returns {Promise<Object>} Object containing user detail and verification instructions
 */
export async function register(userData) {
  const response = await api.post('/auth/register', {
    first_name: userData.firstName,
    last_name: userData.lastName,
    username: userData.username,
    email: userData.email,
    password: userData.password,
  })
  return response.data
}

/**
 * Confirm user email verification.
 * @param {string} token - Verification token sent to email
 * @returns {Promise<Object>} Server status response
 */
export async function verifyEmail(token) {
  const response = await api.post('/auth/verify-email', { token })
  return response.data
}

/**
 * Retrieve the active user profile information.
 * @returns {Promise<Object>} Profile details of the current logged-in user
 */
export async function getProfile() {
  const response = await api.get('/auth/profile')
  return response.data
}

/**
 * Update user profile settings.
 * @param {Object} data - Profile fields to modify
 * @returns {Promise<Object>} Updated profile details
 */
export async function updateProfile(data) {
  const response = await api.patch('/auth/profile', data)
  return response.data
}

/**
 * Terminate the user's active session.
 * @returns {Promise<Object>} Successful logout response
 */
export async function logout() {
  const response = await api.post('/auth/logout')
  return response.data
}
