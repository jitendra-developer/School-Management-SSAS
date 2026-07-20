import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const base = {
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  class_id: z.string().trim().min(1, 'Class is required'),
  roll_number: optionalString,
  email: z.string().trim().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: optionalString,
  parent_name: optionalString,
  parent_phone: optionalString,
  address: optionalString,
  gender: optionalString,
  dob: optionalString,
  photo: optionalString,
  enrollment_date: optionalString,
  status: optionalString,
}

export const createStudentSchema = z.object(base)

export const updateStudentSchema = z.object(base).partial()
