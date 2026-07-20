import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

export const updateSchoolSchema = z.object({
  school_name: z.string().trim().min(1).optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  phone: optionalString,
  address: optionalString,
})
