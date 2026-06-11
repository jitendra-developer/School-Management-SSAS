import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import type { Admin, LoginPayload, RegisterPayload } from '@/types/auth'
import type { ApiResponse } from '@/types/api'
import { storage } from '@/utils/storage'

interface AuthContextValue {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => storage.getAdmin())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = storage.getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authService
      .getMe()
      .then((res) => {
        const responseData = (res.data as ApiResponse<{ admin: Admin }>).data
        if (responseData?.admin) {
          setAdmin(responseData.admin)
          storage.setAdmin(responseData.admin)
        }
      })
      .catch(() => storage.clearAuth())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await authService.login(payload)
    if (!data.success || !data.data) throw new Error(data.message)
    storage.setToken(data.data.token)
    storage.setAdmin(data.data.admin)
    setAdmin(data.data.admin)
    toast.success('Welcome back!')
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await authService.register(payload)
    if (!data.success || !data.data) throw new Error(data.message)
    storage.setToken(data.data.token)
    storage.setAdmin(data.data.admin)
    setAdmin(data.data.admin)
    toast.success('Account created successfully!')
  }, [])

  const logout = useCallback(() => {
    storage.clearAuth()
    setAdmin(null)
    toast.success('Logged out')
  }, [])

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: !!admin && !!storage.getToken(),
      isLoading,
      login,
      register,
      logout,
    }),
    [admin, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
