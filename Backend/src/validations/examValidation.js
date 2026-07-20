import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const examBase = {
  title: z.string().trim().min(1, 'Title is required'),
  type: optionalString,
  subject: z.string().trim().min(1, 'Subject is required'),
  class_id: z.string().trim().min(1, 'Class is required'),
  date: z.string().trim().min(1, 'Date is required'),
  max_marks: z.coerce.number('Max marks is required'),
}

export const createExamSchema = z.object(examBase)
export const updateExamSchema = z.object(examBase).partial()

export const recordResultSchema = z.object({
  student_id: z.string().trim().min(1, 'Student is required'),
  marks_obtained: z.coerce.number('Marks obtained is required'),
  grade: optionalString,
})
