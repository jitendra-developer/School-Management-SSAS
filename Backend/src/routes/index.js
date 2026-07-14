import { Router } from 'express'
import authRoutes from './authRoutes.js'
import studentRoutes from './studentRoutes.js'
import teacherRoutes from './teacherRoutes.js'
import attendanceRoutes from './attendanceRoutes.js'
import feeRoutes from './feeRoutes.js'
import reportRoutes from './reportRoutes.js'
import emailRoutes from './emailRoutes.js'
import schoolRoutes from './schoolRoutes.js'
import examRoutes from './examRoutes.js'
import timetableRoutes from './timetableRoutes.js'
import transportRoutes from './transportRoutes.js'
import libraryRoutes from './libraryRoutes.js'
import hostelRoutes from './hostelRoutes.js'
import classRoutes from './classRoutes.js'
import noticeRoutes from './noticeRoutes.js'
import messageRoutes from './messageRoutes.js'
import teacherAppRoutes from './teacherAppRoutes.js'
import subjectRoutes from './subjectRoutes.js'

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
router.use('/school', schoolRoutes)
router.use('/exams', examRoutes)
router.use('/timetable', timetableRoutes)
router.use('/transport', transportRoutes)
router.use('/library', libraryRoutes)
router.use('/hostels', hostelRoutes)
router.use('/classes', classRoutes)
router.use('/notices', noticeRoutes)
router.use('/messages', messageRoutes)
router.use('/teacher-app', teacherAppRoutes)
router.use('/subjects', subjectRoutes)

export default router
