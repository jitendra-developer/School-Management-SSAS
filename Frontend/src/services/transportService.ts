import api from './api'
import type { ApiResponse } from '@/types/api'
import type { TransportRoute, TransportAssignment } from '@/types/transport'

export const transportService = {
  getRoutes: (params?: Record<string, string>) =>
    api.get<ApiResponse<TransportRoute[]>>('/transport/routes', { params }),
  createRoute: (data: Record<string, unknown>) =>
    api.post<ApiResponse<TransportRoute>>('/transport/routes', data),
  updateRoute: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<TransportRoute>>(`/transport/routes/${id}`, data),
  deleteRoute: (id: string) =>
    api.delete<ApiResponse<null>>(`/transport/routes/${id}`),
  getAssignments: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ assignments: TransportAssignment[]; total: number }>>('/transport/assignments', { params }),
  assignStudent: (data: Record<string, unknown>) =>
    api.post<ApiResponse<TransportAssignment>>('/transport/assign', data),
  removeAssignment: (id: string) =>
    api.delete<ApiResponse<null>>(`/transport/assignments/${id}`),
}
