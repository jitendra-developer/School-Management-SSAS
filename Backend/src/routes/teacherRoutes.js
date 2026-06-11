import { Router } from 'express'
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/').post(createTeacher).get(getAllTeachers)
router.route('/:id').get(getTeacherById).put(updateTeacher).delete(deleteTeacher)

export default router
