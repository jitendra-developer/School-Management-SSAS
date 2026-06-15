export interface TimetableEntry {
  id: string
  class_id: string
  teacher_id?: string
  day_of_week: number
  subject: string
  start_time: string
  end_time: string
  room?: string
  class?: { id: string; name: string; section?: string }
  teacher?: { id: string; first_name: string; last_name: string }
}
