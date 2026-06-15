export interface Exam {
  id: string
  class_id: string
  title: string
  type: string
  subject: string
  date: string
  max_marks: number
  created_at?: string
  class?: { id: string; name: string; section?: string }
  results?: ExamResult[]
}

export interface ExamResult {
  id: string
  exam_id: string
  student_id: string
  marks_obtained: number
  grade?: string
  student?: { id: string; first_name: string; last_name: string }
}
