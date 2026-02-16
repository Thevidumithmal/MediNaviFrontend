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
  console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
        headers: error.response.headers
      })
    } else if (error.request) {
      console.error('API No Response:', {
        url: error.config?.url,
        message: 'No response from server - check if backend is running'
      })
    } else {
      console.error('API Request Error:', error.message)
    }
    throw error
  }
)

export default api
