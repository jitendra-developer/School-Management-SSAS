export interface Admin {
  id: string
  school_id: string
  name: string
  email: string
  role: string
  profile_image?: string
  created_at?: string
  school?: School
}

export interface School {
  id: string
  school_name: string
  email: string
  phone?: string
  address?: string
  logo?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  school_name: string
  school_email: string
  phone?: string
  name: string
  email: string
  password: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
  phone?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface ResetPasswordPayload {
  email: string
  reset_token: string
  newPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    admin: Admin
    school: School
    token: string
  }
}
