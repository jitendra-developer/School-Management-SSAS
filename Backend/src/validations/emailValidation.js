import { z } from 'zod'

export const sendFeeReminderSchema = z.object({
  studentId: z.string().trim().min(1, 'Student is required'),
  feeId: z.string().trim().min(1, 'Fee record is required'),
})
