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
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Class>>(`/classes/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/classes/${id}`),
  bulkUploadStudents: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<{ imported: number; errors: string[] }>>(
      `/classes/${id}/bulk-upload-students`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },
}
