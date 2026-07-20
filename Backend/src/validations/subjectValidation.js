import { z } from 'zod'

export const addSubjectsSchema = z.object({
  names: z.array(z.string().trim().min(1)).min(1, 'At least one subject name is required'),
})
