import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import type { Admin, LoginPayload, RegisterPayload, VerifyOtpPayload } from '@/types/auth'
import type { ApiResponse } from '@/types/api'
import { storage } from '@/utils/storage'
import { scheduleAutoLogout } from '@/utils/autoLogout'

interface AuthContextValue {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<{ email: string }>
  verifyLoginOtp: (payload: VerifyOtpPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  setAdmin: (admin: Admin) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => storage.getAdmin())
  const [isLoading, setIsLoading] = useState(true)
  const timerRef = useRef<number | undefined>(undefined)

  const logout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
    // Fire-and-forget: this invalidates the token server-side (bumps
    // token_version) so it can't be replayed after logout. We still clear
    // local state immediately regardless of whether the request succeeds.
    authService.logout().catch(() => {})
    storage.clearAuth()
    setAdmin(null)
    toast.success('Logged out')
  }, [])

  const startSession = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = scheduleAutoLogout(() => {
      setAdmin(null)
    })
  }, [])

  useEffect(() => {
    const init = async () => {
      const token = storage.getToken()

      if (!token || storage.isTokenExpired()) {
        storage.clearAuth()
        setAdmin(null)
        setIsLoading(false)
        return
      }

      try {
        const res = await authService.getMe()
        const responseData = (res.data as ApiResponse<{ admin: Admin }>).data
        if (responseData?.admin) {
          setAdmin(responseData.admin)
          storage.setAdmin(responseData.admin)
        }
      } catch {
        // The API interceptor already clears auth + redirects on 401 (invalid/expired token).
        // For any other error (network glitch, server down), keep the cached admin so
        // a valid 7-day session is not destroyed by a temporary failure.
        const storedAdmin = storage.getAdmin()
        if (storedAdmin) {
          setAdmin(storedAdmin)
        } else {
          setAdmin(null)
        }
      } finally {
        setIsLoading(false)
      }

      startSession()
    }

    init()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startSession])

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await authService.login(payload)
    if (!data.success) throw new Error(data.message)
    return { email: payload.email }
  }, [])

  const verifyLoginOtp = useCallback(
    async (payload: VerifyOtpPayload) => {
      const { data } = await authService.verifyLoginOtp(payload)
      if (!data.success || !data.data) throw new Error(data.message)
      storage.setToken(data.data.token)
      storage.setAdmin(data.data.admin)
      setAdmin(data.data.admin)
      startSession()
      toast.success('Welcome back!')
    },
    [startSession]
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await authService.register(payload)
      if (!data.success || !data.data) throw new Error(data.message)
      storage.setToken(data.data.token)
      storage.setAdmin(data.data.admin)
      setAdmin(data.data.admin)
      startSession()
      toast.success('Account created successfully!')
    },
    [startSession]
  )

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: !!admin,
      isLoading,
      login,
      verifyLoginOtp,
      register,
      logout,
      setAdmin,
    }),
    [admin, isLoading, login, verifyLoginOtp, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
