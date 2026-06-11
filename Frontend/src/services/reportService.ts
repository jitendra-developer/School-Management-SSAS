import api from './api'
import type { ApiResponse } from '@/types/api'
import type { DashboardStats } from '@/types/report'

export const reportService = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardStats>>('/reports/dashboard'),
  getFees: (params?: Record<string, string>) =>
    api.get<ApiResponse<unknown>>('/reports/fees', { params }),
  getAttendance: (params?: Record<string, string>) =>
    api.get<ApiResponse<unknown>>('/reports/attendance', { params }),
  getStudents: (params?: Record<string, string>) =>
    api.get<ApiResponse<unknown>>('/reports/students', { params }),
}
