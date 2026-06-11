export interface AttendanceRecord {
  id: string
  student_id?: string
  teacher_id?: string
  status: string
  remark?: string
  attendance: { id: string; date: string }
}

export interface DailyAttendance {
  date: string
  present: number
  absent: number
  late: number
}

export interface AttendancePayload {
  date: string
  type: 'student' | 'teacher'
  records: { student_id?: string; teacher_id?: string; status: string; remark?: string }[]
}
