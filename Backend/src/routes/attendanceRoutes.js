import { Router } from 'express'
import {
  markAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getTeacherAttendance,
} from '../controllers/attendanceController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.post('/mark', markAttendance)
router.get('/date/:date', getAttendanceByDate)
router.get('/student/:studentId', getStudentAttendance)
router.get('/teacher/:teacherId', getTeacherAttendance)

export default router
