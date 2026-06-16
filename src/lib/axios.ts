import axios from 'axios'
import { appConfig } from '@/config/app.config'
import { STORAGE_KEYS } from '@/constants'

const axiosInstance = axios.create({
  baseURL: appConfig.apiUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor ─────────────────────────────────────────────────────
// Attach the stored Bearer token to every outgoing request (client-side only)
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

// ── Response interceptor ────────────────────────────────────────────────────
// Handle 401 Unauthorized globally by clearing the session and redirecting
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export { axiosInstance }
