import api from './api'
import type { ApiResponse } from '@/types/api'
import type { Exam, ExamResult } from '@/types/exam'

export const examService = {
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ exams: Exam[]; total: number }>>('/exams', { params }),
  getById: (id: string) =>
    api.get<ApiResponse<Exam>>(`/exams/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Exam>>('/exams', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Exam>>(`/exams/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/exams/${id}`),
  recordResult: (exam_id: string, data: Record<string, unknown>) =>
    api.post<ApiResponse<ExamResult>>(`/exams/${exam_id}/results`, data),
  getResults: (exam_id: string) =>
    api.get<ApiResponse<ExamResult[]>>(`/exams/${exam_id}/results`),
}
