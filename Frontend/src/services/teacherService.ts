import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Teacher } from '@/types/teacher'

export const teacherService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ teachers: Teacher[]; total: number }>>('/teachers', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Teacher>>(`/teachers/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Teacher>>('/teachers', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Teacher>>(`/teachers/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/teachers/${id}`),
}
