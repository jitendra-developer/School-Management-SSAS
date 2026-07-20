import { Router } from 'express'
import {
  register,
  login,
  verifyLoginOtp,
  logout,
  teacherLogin,
  teacherLogout,
  getMe,
  updateProfile,
  uploadProfileImage,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js'
import { protect, protectTeacher } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/login/verify-otp', validate(verifyOtpSchema), verifyLoginOtp)
router.post('/teacher/login', validate(loginSchema), teacherLogin)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

router.get('/me', protect, getMe)
router.put('/profile', protect, validate(updateProfileSchema), updateProfile)
router.post('/profile/image', protect, uploadProfileImage)
router.post('/change-password', protect, validate(changePasswordSchema), changePassword)
router.post('/logout', protect, logout)
router.post('/teacher/logout', protectTeacher, teacherLogout)

export default router
