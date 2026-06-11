import api from './api'
import type { ApiResponse } from '@/types/api'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth'

/** Authentication API — register, login, profile */
export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthResponse['data']>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse['data']>>('/auth/login', payload),

  getMe: () => api.get<ApiResponse>('/auth/me'),
}
