import { z } from 'zod'

const optionalString = z.string().trim().optional().nullable()

const entryBase = {
  class_id: z.string().trim().min(1, 'Class is required'),
  teacher_id: optionalString,
  day_of_week: z.coerce.number('Day of week is required').int().min(0).max(6),
  subject: z.string().trim().min(1, 'Subject is required'),
  start_time: z.string().trim().min(1, 'Start time is required'),
  end_time: z.string().trim().min(1, 'End time is required'),
  room: optionalString,
}

export const createTimetableEntrySchema = z.object(entryBase)
export const updateTimetableEntrySchema = z.object(entryBase).partial()
