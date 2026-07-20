import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const base = {
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: optionalString,
  subject: optionalString,
  qualification: optionalString,
  class_id: optionalString,
  class_ids: z.array(z.string()).optional(),
  gender: optionalString,
  dob: optionalString,
  password: optionalString,
}

export const createTeacherSchema = z.object(base)

export const updateTeacherSchema = z.object(base).partial()
