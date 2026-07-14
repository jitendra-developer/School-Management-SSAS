import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Subject } from '@/types/subject'

export const subjectService = {
  getAll: () =>
    api.get<ApiResponse<string[]>>('/subjects/all'),
  getByClass: (classId: string) =>
    api.get<ApiResponse<Subject[]>>(`/subjects/class/${classId}`),
  addSubjects: (classId: string, names: string[]) =>
    api.post<ApiResponse<Subject[]>>(`/subjects/class/${classId}`, { names }),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/subjects/${id}`),
}
