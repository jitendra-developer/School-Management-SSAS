import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Student } from '@/types/student'

export const studentService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ students: Student[]; total: number }>>('/students', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Student>>(`/students/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Student>>('/students', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/students/${id}`),
}
