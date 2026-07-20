import { z } from 'zod'

const email = z.string().trim().min(1, 'Email is required').email('Invalid email address')
const newPassword = z.string().min(6, 'Password must be at least 6 characters')

export const registerSchema = z.object({
  school_name: z.string().trim().min(1, 'School name is required'),
  school_email: email,
  phone: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Name is required'),
  email,
  password: newPassword,
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: email.optional(),
  phone: z.string().trim().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword,
})

export const forgotPasswordSchema = z.object({
  email,
})

export const verifyOtpSchema = z.object({
  email,
  otp: z.string().trim().min(1, 'OTP is required'),
})

export const resetPasswordSchema = z.object({
  email,
  reset_token: z.string().min(1, 'Reset token is required'),
  newPassword,
})
