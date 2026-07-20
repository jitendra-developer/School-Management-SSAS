import { Router } from 'express'
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createStudentSchema, updateStudentSchema } from '../validations/studentValidation.js'

const router = Router()

router.use(protect)

router.route('/').post(validate(createStudentSchema), createStudent).get(getAllStudents)
router.route('/:id').get(getStudentById).put(validate(updateStudentSchema), updateStudent).delete(deleteStudent)

export default router
