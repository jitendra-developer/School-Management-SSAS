import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { updateSchool } from '../controllers/schoolController.js'

const router = Router()

router.put('/update', protect, updateSchool)

export default router
