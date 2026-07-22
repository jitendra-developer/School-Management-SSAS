export interface Teacher {
  id: string
  school_id: string
  class_id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  subject?: string
  qualification?: string
  address?: string
  gender?: string
  dob?: string
  photo?: string
  joining_date: string
  status: string
  created_at: string
  class?: { id: string; name: string; section?: string }
  classes?: { id: string; name: string; section?: string }[]
}

export interface TeacherForm {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  subject?: string
  qualification?: string
  class_id?: string
  class_ids?: string[]
  gender?: string
  password?: string
}
