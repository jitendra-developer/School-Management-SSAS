const TOKEN_KEY = 'bf_token'
const ADMIN_KEY = 'bf_admin'
const TEACHER_TOKEN_KEY = 'bf_teacher_token'
const TEACHER_KEY = 'bf_teacher'

function decodeToken(token: string): { exp?: number } | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getAdmin: () => {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? JSON.parse(raw) : null
  },
  setAdmin: (admin: object) => localStorage.setItem(ADMIN_KEY, JSON.stringify(admin)),
  removeAdmin: () => localStorage.removeItem(ADMIN_KEY),

  getTeacherToken: (): string | null => localStorage.getItem(TEACHER_TOKEN_KEY),
  setTeacherToken: (token: string) => localStorage.setItem(TEACHER_TOKEN_KEY, token),
  removeTeacherToken: () => localStorage.removeItem(TEACHER_TOKEN_KEY),

  getTeacher: () => {
    const raw = localStorage.getItem(TEACHER_KEY)
    return raw ? JSON.parse(raw) : null
  },
  setTeacher: (teacher: object) => localStorage.setItem(TEACHER_KEY, JSON.stringify(teacher)),
  removeTeacher: () => localStorage.removeItem(TEACHER_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  },

  clearTeacherAuth: () => {
    localStorage.removeItem(TEACHER_TOKEN_KEY)
    localStorage.removeItem(TEACHER_KEY)
  },

  isTokenExpired: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return true
    const decoded = decodeToken(token)
    if (!decoded?.exp) return true
    return Date.now() >= decoded.exp * 1000
  },

  getTokenExpiresInMs: (): number | null => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    const decoded = decodeToken(token)
    if (!decoded?.exp) return null
    const remaining = decoded.exp * 1000 - Date.now()
    return remaining > 0 ? remaining : 0
  },
}
