import { Router } from 'express'
import {
  sendFeeReminder,
  sendBulkFeeReminders,
} from '../controllers/emailController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.post('/fee-reminder', sendFeeReminder)
router.post('/bulk-fee-reminders', sendBulkFeeReminders)

export default router
