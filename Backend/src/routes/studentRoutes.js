import { Router } from 'express'
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/').post(createStudent).get(getAllStudents)
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent)

export default router
