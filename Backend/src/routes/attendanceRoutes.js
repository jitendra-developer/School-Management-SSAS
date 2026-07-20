import { Router } from 'express'
import {
  markAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getTeacherAttendance,
} from '../controllers/attendanceController.js'
import { protectAdminOrTeacher } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { markAttendanceSchema } from '../validations/attendanceValidation.js'

const router = Router()

router.use(protectAdminOrTeacher)

router.post('/mark', validate(markAttendanceSchema), markAttendance)
router.get('/date/:date', getAttendanceByDate)
router.get('/student/:studentId', getStudentAttendance)
router.get('/teacher/:teacherId', getTeacherAttendance)

export default router
