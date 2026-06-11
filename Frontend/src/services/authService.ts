import api from './api'
import type { ApiResponse } from '@/types/api'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  VerifyOtpPayload,
  ResetPasswordPayload,
} from '@/types/auth'

export const authService = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthResponse['data']>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthResponse['data']>>('/auth/login', payload),

  getMe: () => api.get<ApiResponse>('/auth/me'),

  changePassword: (payload: ChangePasswordPayload) =>
    api.post<ApiResponse>('/auth/change-password', payload),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<ApiResponse>('/auth/forgot-password', payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<ApiResponse<{ reset_token: string }>>('/auth/verify-otp', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<ApiResponse>('/auth/reset-password', payload),
}
