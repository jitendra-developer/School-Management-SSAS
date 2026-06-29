import axios from 'axios'
import { storage } from '@/utils/storage'

/**
 * Central Axios instance — all API calls go through this.
 * Attaches JWT from localStorage; handles 401 globally.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const adminToken = storage.getToken()
  const teacherToken = storage.getTeacherToken()
  const token = adminToken || teacherToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isTeacherPage = window.location.pathname.startsWith('/teacher-attendance')
      if (isTeacherPage) {
        storage.clearTeacherAuth()
      } else {
        storage.clearAuth()
      }
      if (!window.location.pathname.startsWith('/login') && !isTeacherPage) {
        window.location.href = '/login'
      } else if (isTeacherPage) {
        window.location.href = '/teacher-attendance'
      }
    }
    return Promise.reject(error)
  }
)

export default api
