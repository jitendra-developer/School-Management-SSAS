import { Router } from 'express'
import {
  getDashboardStats,
  getFeeReport,
  getAttendanceReport,
  getStudentReport,
} from '../controllers/reportController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/dashboard', getDashboardStats)
router.get('/fees', getFeeReport)
router.get('/attendance', getAttendanceReport)
router.get('/students', getStudentReport)

export default router
