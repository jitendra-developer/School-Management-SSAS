import { Router } from 'express'
import { createClass, getAllClasses, getClassById, getClassStudents, updateClass, deleteClass, bulkUploadStudents } from '../controllers/classController.js'
import { protect } from '../middleware/auth.js'
import { uploadSpreadsheet } from '../config/multer.js'
import { validate } from '../middleware/validate.js'
import { createClassSchema, updateClassSchema } from '../validations/classValidation.js'

const router = Router()

router.use(protect)

router.route('/').post(validate(createClassSchema), createClass).get(getAllClasses)
router.route('/:id').get(getClassById).put(validate(updateClassSchema), updateClass).delete(deleteClass)
router.get('/:id/students', getClassStudents)
router.post('/:id/bulk-upload-students', uploadSpreadsheet.single('file'), bulkUploadStudents)

export default router
