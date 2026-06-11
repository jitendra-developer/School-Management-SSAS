import { Router } from 'express'
import authRoutes from './authRoutes.js'
import studentRoutes from './studentRoutes.js'
import teacherRoutes from './teacherRoutes.js'
import attendanceRoutes from './attendanceRoutes.js'
import feeRoutes from './feeRoutes.js'
import reportRoutes from './reportRoutes.js'
import emailRoutes from './emailRoutes.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Bright Future API is running' })
})

router.use('/auth', authRoutes)
router.use('/students', studentRoutes)
router.use('/teachers', teacherRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/fees', feeRoutes)
router.use('/reports', reportRoutes)
router.use('/email', emailRoutes)

export default router
