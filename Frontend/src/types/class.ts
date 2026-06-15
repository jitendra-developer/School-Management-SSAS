export interface Class {
  id: string
  school_id: string
  name: string
  section?: string
  _count: { students: number }
  created_at: string
}
