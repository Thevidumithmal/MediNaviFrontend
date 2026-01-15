import axios from 'axios'

// Use Vite dev proxy in development (empty baseURL),
// allow overriding via VITE_API_URL, and default to localhost in non-dev.
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080')

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
