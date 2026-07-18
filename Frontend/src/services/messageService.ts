import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Message } from '@/types/message'

export const messageService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ messages: Message[]; total: number }>>('/messages', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Message>>(`/messages/${id}`),
  send: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Message>>('/messages/send', data),
  markRead: (id: string) =>
    api.put<ApiResponse<Message>>(`/messages/${id}/read`),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/messages/${id}`),
}
