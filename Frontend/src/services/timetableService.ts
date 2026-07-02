import api from './api'
import type { ApiResponse } from '@/types/api'
import type { TimetableEntry } from '@/types/timetable'

export const timetableService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ timetable: TimetableEntry[]; total: number }>>('/timetable', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<TimetableEntry>>(`/timetable/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<TimetableEntry>>('/timetable', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<TimetableEntry>>(`/timetable/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/timetable/${id}`),
}
