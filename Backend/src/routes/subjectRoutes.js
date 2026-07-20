import { Router } from 'express'
import { getAllSubjects, getSubjectsByClass, addSubjects, deleteSubject } from '../controllers/subjectController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { addSubjectsSchema } from '../validations/subjectValidation.js'

const router = Router()

router.use(protect)

router.get('/all', getAllSubjects)
router.get('/class/:classId', getSubjectsByClass)
router.post('/class/:classId', validate(addSubjectsSchema), addSubjects)
router.delete('/:id', deleteSubject)

export default router
