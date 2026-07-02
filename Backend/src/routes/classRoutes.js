import { Router } from 'express'
import { createClass, getAllClasses, getClassById, getClassStudents, updateClass, deleteClass, bulkUploadStudents } from '../controllers/classController.js'
import { protect } from '../middleware/auth.js'
import { uploadSpreadsheet } from '../config/multer.js'

const router = Router()

router.use(protect)

router.route('/').post(createClass).get(getAllClasses)
router.route('/:id').get(getClassById).put(updateClass).delete(deleteClass)
router.get('/:id/students', getClassStudents)
router.post('/:id/bulk-upload-students', uploadSpreadsheet.single('file'), bulkUploadStudents)

export default router
