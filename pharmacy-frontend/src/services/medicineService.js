import api from './api'

export async function searchMedicines({ name, lat, lon }) {
  const params = { name }
  // Ensure numeric coords and provide both `lon` and `lng` for backend compatibility
  if (lat != null && lon != null) {
    const latNum = Number(lat)
    const lonNum = Number(lon)
    if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
      params.lat = latNum
      params.lon = lonNum
      params.lng = lonNum // some backends expect `lng`
    }
  }
  const { data } = await api.get('/medicines/search', { params })
  return data
}
