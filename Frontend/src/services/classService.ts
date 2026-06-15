import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Class } from '@/types/class'
import type { Student } from '@/types/student'

export const classService = {
  getAll: () =>
    api.get<ApiResponse<Class[]>>('/classes'),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Class>>('/classes', data),
  getById: (id: string) =>
    api.get<ApiResponse<Class>>(`/classes/${id}`),
  getStudents: (id: string, params?: Record<string, string>) =>
    api.get<ApiResponse<{ students: Student[]; total: number }>>(`/classes/${id}/students`, { params }),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/classes/${id}`),
}
