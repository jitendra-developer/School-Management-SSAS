import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Notice } from '@/types/notice'

export const noticeService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ notices: Notice[]; total: number }>>('/notices', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Notice>>(`/notices/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Notice>>('/notices', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Notice>>(`/notices/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/notices/${id}`),
}
