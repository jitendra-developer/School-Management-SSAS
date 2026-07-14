import { Router } from 'express'
import { getAllSubjects, getSubjectsByClass, addSubjects, deleteSubject } from '../controllers/subjectController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/all', getAllSubjects)
router.get('/class/:classId', getSubjectsByClass)
router.post('/class/:classId', addSubjects)
router.delete('/:id', deleteSubject)

export default router
