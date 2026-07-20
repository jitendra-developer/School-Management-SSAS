import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { updateSchoolSchema } from '../validations/schoolValidation.js'
import { updateSchool } from '../controllers/schoolController.js'

const router = Router()

router.put('/update', protect, validate(updateSchoolSchema), updateSchool)

export default router
