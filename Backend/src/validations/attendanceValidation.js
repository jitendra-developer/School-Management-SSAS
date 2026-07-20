import { z } from 'zod'

export const markAttendanceSchema = z.object({
  date: z.string().trim().min(1, 'Date is required'),
  type: z.enum(['student', 'teacher']),
  records: z.array(
    z.object({
      student_id: z.string().trim().optional(),
      teacher_id: z.string().trim().optional(),
      status: z.string().trim().min(1, 'Status is required'),
      remark: z.string().trim().optional().nullable(),
    })
  ).min(1, 'At least one record is required'),
})
