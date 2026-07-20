import { Router } from 'express'
import {
  sendFeeReminder,
  sendBulkFeeReminders,
} from '../controllers/emailController.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { sendFeeReminderSchema } from '../validations/emailValidation.js'

const router = Router()

router.use(protect)

router.post('/fee-reminder', validate(sendFeeReminderSchema), sendFeeReminder)
router.post('/bulk-fee-reminders', sendBulkFeeReminders)

export default router
