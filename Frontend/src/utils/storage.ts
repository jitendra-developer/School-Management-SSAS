const TOKEN_KEY = 'bf_token'
const ADMIN_KEY = 'bf_admin'

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

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
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
