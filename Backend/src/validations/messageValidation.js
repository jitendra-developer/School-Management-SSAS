import { z } from 'zod'

export const sendMessageSchema = z.object({
  receiver_id: z.string().trim().optional(),
  subject: z.string().trim().min(1, 'Subject is required'),
  body: z.string().trim().min(1, 'Message body is required'),
})
