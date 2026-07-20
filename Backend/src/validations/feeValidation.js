import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()
const amounts = z.object({
  tuition: z.union([z.string(), z.number()]).optional().nullable(),
  transport: z.union([z.string(), z.number()]).optional().nullable(),
  exam: z.union([z.string(), z.number()]).optional().nullable(),
  other: z.union([z.string(), z.number()]).optional().nullable(),
}).optional()

const planBase = {
  name: z.string().trim().min(1, 'Plan name is required'),
  amount: z.coerce.number('Amount is required'),
  frequency: optionalString,
  category: optionalString,
  description: optionalString,
  due_date: z.union([z.string(), z.number()]).optional().nullable(),
}

export const createFeePlanSchema = z.object(planBase)
export const updateFeePlanSchema = z.object(planBase).partial()

export const assignFeeSchema = z.object({
  student_id: z.string().trim().min(1, 'Student is required'),
  plan_id: optionalString,
  amounts,
  due_date: z.string().trim().min(1, 'Due date is required'),
})

export const assignFeeBatchSchema = z.object({
  student_ids: z.array(z.string().trim().min(1)).min(1, 'Select at least one student'),
  plan_id: optionalString,
  amounts,
  due_date: z.string().trim().min(1, 'Due date is required'),
})

export const recordPaymentSchema = z.object({
  paid: z.coerce.number('Payment amount is required').positive('Payment amount must be greater than 0'),
  payment_method: z.string().trim().min(1, 'Payment method is required'),
  remark: optionalString,
  receipt_number: optionalString,
})

export const updateFeeSchema = z.object({
  tuition_amount: z.union([z.string(), z.number()]).optional().nullable(),
  transport_amount: z.union([z.string(), z.number()]).optional().nullable(),
  exam_amount: z.union([z.string(), z.number()]).optional().nullable(),
  other_amount: z.union([z.string(), z.number()]).optional().nullable(),
  due_date: optionalString,
})
