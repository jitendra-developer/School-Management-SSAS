export interface Student {
  id: string
  school_id: string
  class_id: string
  first_name: string
  last_name: string
  roll_number?: string
  email?: string
  phone?: string
  parent_name?: string
  parent_phone?: string
  address?: string
  gender?: string
  dob?: string
  photo?: string
  enrollment_date: string
  status: string
  created_at: string
  class?: { id: string; name: string; section?: string }
  attendance_percentage?: number | null
}

export interface StudentForm {
  first_name: string
  last_name: string
  class_id: string
  email?: string
  phone?: string
  parent_name?: string
  parent_phone?: string
  address?: string
  gender?: string
  dob?: string
}
