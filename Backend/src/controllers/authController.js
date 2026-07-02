import { authService } from '../services/authService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import { upload } from '../config/multer.js'

/**
 * Auth HTTP handlers — thin layer over authService.
 */
export const register = asyncHandler(async (req, res) => {
  const { school_name, school_email, phone, name, email, password } = req.body

  if (!school_name || !school_email || !name || !email || !password) {
    const err = new Error('Please provide all required fields')
    err.statusCode = 400
    throw err
  }

  const data = await authService.register({
    school_name,
    school_email,
    phone,
    name,
    email,
    password,
  })

  return successResponse(res, {
    message: 'Registration successful',
    data,
    statusCode: 201,
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    const err = new Error('Email and password are required')
    err.statusCode = 400
    throw err
  }

  const data = await authService.login({ email, password })

  return successResponse(res, {
    message: 'Login successful',
    data,
  })
})

export const getMe = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.admin.id)

  return successResponse(res, {
    message: 'Profile fetched',
    data,
  })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body
  const data = await authService.updateProfile(req.admin.id, { name, email, phone })

  return successResponse(res, {
    message: 'Profile updated',
    data,
  })
})

export const uploadProfileImage = [
  upload.single('profile_image'),
  asyncHandler(async (req, res) => {
    const data = await authService.uploadProfileImage(req.admin.id, req.file)

    return successResponse(res, {
      message: 'Profile image updated',
      data,
    })
  }),
]

export const teacherLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    const err = new Error('Email and password are required')
    err.statusCode = 400
    throw err
  }

  const data = await authService.teacherLogin({ email, password })

  return successResponse(res, {
    message: 'Teacher login successful',
    data,
  })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    const err = new Error('Current password and new password are required')
    err.statusCode = 400
    throw err
  }

  if (newPassword.length < 6) {
    const err = new Error('New password must be at least 6 characters')
    err.statusCode = 400
    throw err
  }

  const data = await authService.changePassword(req.admin.id, { currentPassword, newPassword })

  return successResponse(res, {
    message: 'Password changed successfully',
    data,
  })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    const err = new Error('Email is required')
    err.statusCode = 400
    throw err
  }

  const data = await authService.forgotPassword({ email })

  return successResponse(res, {
    message: data.message,
    data,
  })
})

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    const err = new Error('Email and OTP are required')
    err.statusCode = 400
    throw err
  }

  const data = await authService.verifyOtp({ email, otp })

  return successResponse(res, {
    message: 'OTP verified',
    data,
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, reset_token, newPassword } = req.body

  if (!email || !reset_token || !newPassword) {
    const err = new Error('Email, reset token, and new password are required')
    err.statusCode = 400
    throw err
  }

  const data = await authService.resetPassword({ email, reset_token, newPassword })

  return successResponse(res, {
    message: 'Password reset successful',
    data,
  })
})
