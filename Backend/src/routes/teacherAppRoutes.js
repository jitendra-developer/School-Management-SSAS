import { Router } from 'express'
import { getMyClass } from '../controllers/teacherAppController.js'
import { protectTeacher } from '../middleware/auth.js'

const router = Router()

router.use(protectTeacher)

router.get('/my-class', getMyClass)

export default router
