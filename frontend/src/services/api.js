import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {}
    }
    
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Handle FormData requests
    if (config.data instanceof FormData) {
      // For FormData, remove Content-Type so browser sets it with boundary automatically
      delete config.headers['Content-Type']
    } else if (!(config.data instanceof FormData) && config.data) {
      // Only set Content-Type for non-FormData requests with data
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      // Redirect to login if needed
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default api
