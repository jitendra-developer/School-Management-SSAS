import { Router } from 'express'
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createTeacherSchema, updateTeacherSchema } from '../validations/teacherValidation.js'

const router = Router()

router.use(protect)

router.route('/').post(validate(createTeacherSchema), createTeacher).get(getAllTeachers)
router.route('/:id').get(getTeacherById).put(validate(updateTeacherSchema), updateTeacher).delete(deleteTeacher)

export default router
