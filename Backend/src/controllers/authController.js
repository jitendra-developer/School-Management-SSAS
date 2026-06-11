import { authService } from '../services/authService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

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
