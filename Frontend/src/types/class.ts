export interface Class {
  id: string
  school_id: string
  name: string
  section?: string
  fee_amount?: number | null
  _count: { students: number }
  created_at: string
  teachers?: { id: string; first_name: string; last_name: string; email?: string }[]
}
