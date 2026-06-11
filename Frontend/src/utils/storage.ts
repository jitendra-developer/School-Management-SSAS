const TOKEN_KEY = 'bf_token'
const ADMIN_KEY = 'bf_admin'

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
}
