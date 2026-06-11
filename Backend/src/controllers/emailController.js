import { emailService } from '../services/emailService.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

export const sendFeeReminder = asyncHandler(async (req, res) => {
  const { studentId, feeId } = req.body
  const data = await emailService.sendFeeReminder(studentId, feeId, req.admin.school_id)
  return successResponse(res, { message: 'Reminder sent', data })
})

export const sendBulkFeeReminders = asyncHandler(async (req, res) => {
  const data = await emailService.sendBulkFeeReminders(req.admin.school_id)
  return successResponse(res, { message: 'Bulk reminders sent', data })
})
