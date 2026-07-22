export type FeeCategory = 'tuition' | 'transport' | 'exam' | 'other'
export type PlanCategory = FeeCategory | 'total'

export interface FeePlan {
  id: string
  school_id: string
  name: string
  amount: number
  frequency: string
  category: PlanCategory
  description?: string
  due_date?: number
}

export interface FeePayment {
  id: string
  fee_id: string
  receipt_number: string
  amount: number
  payment_method: string
  payment_date: string
  remark?: string
}

export interface Fee {
  id: string
  school_id: string
  student_id: string
  class_id: string
  plan_id?: string
  tuition_amount: number
  transport_amount: number
  exam_amount: number
  other_amount: number
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
