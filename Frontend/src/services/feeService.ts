import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Fee, FeePlan } from '@/types/fee'

export const feeService = {
  getPlans: () =>
    api.get<ApiResponse<FeePlan[]>>('/fees/plans'),
  createPlan: (data: Record<string, unknown>) =>
    api.post<ApiResponse<FeePlan>>('/fees/plans', data),
  assignFee: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Fee>>('/fees/assign', data),
  recordPayment: (feeId: string, data: Record<string, unknown>) =>
    api.post<ApiResponse<Fee>>(`/fees/pay/${feeId}`, data),
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ fees: Fee[]; total: number }>>('/fees', { params }),
  getPending: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ fees: Fee[]; total: number }>>('/fees/pending', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Fee>>(`/fees/${id}`),
}
