import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()
const optionalNumber = z.coerce.number().optional().nullable()

export const createClassSchema = z.object({
  name: z.string().trim().min(1, 'Class name is required'),
  section: optionalString,
  fee_amount: z.coerce.number('Fee amount is required'),
  transport_fee: optionalNumber,
  exam_fee: optionalNumber,
  other_fee: optionalNumber,
  teacher_id: optionalString,
  subjects: z.array(z.string().trim().min(1)).min(1, 'At least one subject is required'),
})

export const updateClassSchema = z.object({
  name: z.string().trim().min(1).optional(),
  section: optionalString,
  fee_amount: optionalNumber,
  transport_fee: optionalNumber,
  exam_fee: optionalNumber,
  other_fee: optionalNumber,
  teacher_id: optionalString,
  subjects: z.array(z.string().trim().min(1)).optional(),
})
