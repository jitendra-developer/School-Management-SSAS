import { Router } from 'express'
import {
  register,
  login,
  teacherLogin,
  getMe,
  updateProfile,
  uploadProfileImage,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/teacher/login', teacherLogin)
router.post('/forgot-password', forgotPassword)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)

router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.post('/profile/image', protect, uploadProfileImage)
router.post('/change-password', protect, changePassword)

export default router
