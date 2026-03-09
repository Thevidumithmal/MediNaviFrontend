import api from './api'

/**
 * Get current authenticated user's profile
 * Backend endpoint: GET /api/users/me
 */
export async function getCurrentUserProfile() {
  const { data } = await api.get('/api/users/me')
  return data
}

/**
 * Update user profile (username and phone only)
 * Backend endpoint: PUT /api/users/me
 */
export async function updateUserProfile(payload) {
  const { data } = await api.put('/api/users/me', payload)
  return data
}

/**
 * Change user password
 * Backend endpoint: PUT /api/users/me/password
 * Payload: { currentPassword, newPassword }
 */
export async function changePassword(payload) {
  const { data } = await api.put('/api/users/me/password', payload)
  return data
}
