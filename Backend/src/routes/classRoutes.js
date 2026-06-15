import { Router } from 'express'
import { createClass, getAllClasses, getClassById, getClassStudents, deleteClass } from '../controllers/classController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.route('/').post(createClass).get(getAllClasses)
router.route('/:id').get(getClassById).delete(deleteClass)
router.get('/:id/students', getClassStudents)

export default router
