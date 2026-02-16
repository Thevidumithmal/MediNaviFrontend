import api from './api'

// ===== REPORTS & ANALYTICS =====
export async function getAdminStats() {
  const { data } = await api.get('/admin/stats')
  return data
}

// ===== PHARMACY MANAGEMENT =====
export async function getAllPharmacies() {
  const { data } = await api.get('/admin/pharmacies')
  return data
}

export async function createPharmacy(payload) {
  const { data } = await api.post('/admin/pharmacies', payload)
  return data
}

export async function updatePharmacy(pharmacyId, payload) {
  const { data } = await api.put(`/admin/pharmacies/${pharmacyId}`, payload)
  return data
}

export async function deletePharmacy(pharmacyId) {
  const { data } = await api.delete(`/admin/pharmacies/${pharmacyId}`)
  return data
}

// ===== USER MANAGEMENT =====
export async function getAllUsers(params = {}) {
  const { data } = await api.get('/admin/users', { params })
  return data
}

export async function createUser(payload) {
  const { data } = await api.post('/admin/users', payload)
  return data
}

export async function updateUserStatus(userId, payload) {
  const { data } = await api.put(`/admin/users/${userId}/status`, payload)
  return data
}

export async function changeUserPassword(userId, payload) {
  const { data } = await api.put(`/admin/users/${userId}/password`, payload)
  return data
}

export async function deleteUser(userId) {
  const { data } = await api.delete(`/admin/users/${userId}`)
  return data
}
