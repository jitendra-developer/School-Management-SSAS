import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Fee, FeePlan, FeePayment } from '@/types/fee'

export const feeService = {
  getPlans: () =>
    api.get<ApiResponse<FeePlan[]>>('/fees/plans'),
  createPlan: (data: Record<string, unknown>) =>
    api.post<ApiResponse<FeePlan>>('/fees/plans', data),
  updatePlan: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<FeePlan>>(`/fees/plans/${id}`, data),
  deletePlan: (id: string) =>
    api.delete<ApiResponse<null>>(`/fees/plans/${id}`),
  assignFee: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Fee>>('/fees/assign', data),
  assignFeeBatch: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ created: number; updated: number; invalid: number }>>('/fees/assign-batch', data),
  recordPayment: (feeId: string, data: Record<string, unknown>) =>
    api.post<ApiResponse<{ fee: Fee; payment: FeePayment }>>(`/fees/pay/${feeId}`, data),
  getPayments: (feeId: string) =>
    api.get<ApiResponse<FeePayment[]>>(`/fees/${feeId}/payments`),
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ fees: Fee[]; total: number; page: number; totalPages: number }>>('/fees', { params }),
  getPending: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ fees: Fee[]; total: number }>>('/fees/pending', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Fee>>(`/fees/${id}`),
  updateFee: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Fee>>(`/fees/${id}`, data),
}
