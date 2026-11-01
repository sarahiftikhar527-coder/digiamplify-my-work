import axios from 'axios'
import { tokenStore } from './tokenStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const apiClient = axios.create({
  baseURL,
  withCredentials: true, // refresh cookie ke liye
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise = null

// Ek waqt mein sirf ek refresh chalta hai
export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        const token = res.data.data.accessToken
        tokenStore.set(token)
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh')

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        const token = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      } catch {
        tokenStore.clear()
        window.dispatchEvent(new Event('auth:logout'))
      }
    }

    const err = new Error(
      error.response?.data?.message || error.message || 'Request failed'
    )
    err.status = status
    err.errors = error.response?.data?.errors
    return Promise.reject(err)
  }
)

// Backend ka { success, data, message } khol kar sirf data deta hai
export const unwrap = (promise) => promise.then((res) => res.data.data)

export default apiClient