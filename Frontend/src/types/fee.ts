export interface FeePlan {
  id: string
  school_id: string
  name: string
  amount: number
  frequency: string
  description?: string
  due_date?: number
}

export interface Fee {
  id: string
  school_id: string
  student_id: string
  class_id: string
  plan_id?: string
  amount: number
  paid: number
  due_date: string
  status: 'pending' | 'partial' | 'paid'
  payment_date?: string
  payment_method?: string
  remark?: string
  student?: { id: string; first_name: string; last_name: string }
  plan?: FeePlan
  class?: { id: string; name: string; section?: string }
}
