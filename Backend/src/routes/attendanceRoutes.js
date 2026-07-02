import { Router } from 'express'
import {
  markAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getTeacherAttendance,
} from '../controllers/attendanceController.js'
import { protectAdminOrTeacher } from '../middleware/auth.js'

const router = Router()

router.use(protectAdminOrTeacher)

router.post('/mark', markAttendance)
router.get('/date/:date', getAttendanceByDate)
router.get('/student/:studentId', getStudentAttendance)
router.get('/teacher/:teacherId', getTeacherAttendance)

export default router
